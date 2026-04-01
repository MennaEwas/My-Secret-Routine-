import { GoogleGenAI } from "@google/genai";
import { challengeData } from "../data/challengeData";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are a structured 30-day gratitude and manifestation coach based strictly on the book "The Secret" by Rhonda Byrne.

You support two languages: English and Arabic.

🔹 USER INPUT FORMAT
The user may send:
A day number (1–30)
A preferred language: "EN" or "AR"

If no language is specified → default to English.

🔹 CORE BEHAVIOR
Return ONLY the requested day
Respond in the requested language
Keep structure identical across languages

🔹 STRICT RULES
You MUST:
Use only concepts from The Secret: Gratitude, Visualization, Affirmations, Emotional alignment, Acting as if, Reframing thoughts, Inspired action
You MUST NOT:
Add external frameworks, Add psychology theories, Change the format

🔹 OUTPUT FORMAT (MANDATORY)
If English:
Day [X]
Main Focus:
[Short title]
Tasks:
- [Task 1]
- [Task 2]
- [Task 3]
Example:
[Simple real-life example]
Reflection Prompt:
[One question]

If Arabic:
اليوم [X]
التركيز الأساسي:
[عنوان قصير]
المهام:
- [مهمة 1]
- [مهمة 2]
- [مهمة 3]
مثال:
[مثال بسيط من الحياة الواقعية]
سؤال للتفكير:
[سؤال واحد]

🔹 IMAGE SUPPORT RULE
If the task includes visualization, vision boards, or imagining life:
Add a section at the end:
English:
Image Upload:
Upload images that represent your goal (e.g., dream job, travel, lifestyle)

Arabic:
رفع الصور:
قم برفع صور تعبر عن هدفك (مثل العمل، السفر، نمط الحياة)

🔹 USER RESPONSE HANDLING
If the user writes a reflection:
Acknowledge briefly
Encourage positivity
Stay in same language

🔹 DATA SOURCE
Use the provided day data.`;

export async function getDayContent(day: number, language: "EN" | "AR") {
  const dayData = challengeData.find((d) => d.day === day);
  if (!dayData) throw new Error("Day not found");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Day ${day} - ${language}\n\nData:\nFocus: ${dayData.focus}\nTasks: ${dayData.tasks.join(", ")}\nExample: ${dayData.example}\nReflection Prompt: ${dayData.reflectionPrompt}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching day content:", error);
    return null;
  }
}

export async function getCoachResponse(day: number, reflection: string, language: "EN" | "AR", images?: { data: string, mimeType: string }[]) {
  try {
    const parts: any[] = [
      {
        text: `The user is on Day ${day}. Language: ${language}.\nThe user has submitted the following reflection:\n"${reflection}"\n\nRespond to the user based on the STRICT RULES. Give short encouragement and positive reinforcement. Stay in the same language.`
      }
    ];

    if (images && images.length > 0) {
      for (const img of images) {
        parts.push({
          inlineData: {
            data: img.data,
            mimeType: img.mimeType
          }
        });
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating coach response:", error);
    return language === "AR" ? "هذا رائع! استمر في التركيز على المشاعر الإيجابية." : "That is wonderful! Keep focusing on the good feelings and stay aligned with your desires. You are doing great!";
  }
}

export function parseGeminiDayResponse(text: string, fallbackDay: number) {
  const result = {
    day: fallbackDay,
    focus: '',
    tasks: [] as string[],
    example: '',
    reflectionPrompt: '',
    imageUploadPrompt: ''
  };
  
  const lines = text.split('\n').map(l => l.trim());
  let currentSection = '';
  
  for (const line of lines) {
    if (!line) continue;
    
    if (line.match(/^(Day|اليوم)\s+\[?\d+\]?/i)) {
      const match = line.match(/\d+/);
      if (match) result.day = parseInt(match[0]);
      continue;
    }
    
    if (line.match(/^(Main Focus|التركيز الأساسي):/i)) {
      currentSection = 'focus';
      result.focus = line.replace(/^(Main Focus|التركيز الأساسي):\s*/i, '').trim();
      continue;
    }
    
    if (line.match(/^(Tasks|المهام):/i)) {
      currentSection = 'tasks';
      continue;
    }
    
    if (line.match(/^(Example|مثال):/i)) {
      currentSection = 'example';
      result.example = line.replace(/^(Example|مثال):\s*/i, '').trim();
      continue;
    }
    
    if (line.match(/^(Reflection Prompt|سؤال للتفكير):/i)) {
      currentSection = 'reflection';
      result.reflectionPrompt = line.replace(/^(Reflection Prompt|سؤال للتفكير):\s*/i, '').trim();
      continue;
    }
    
    if (line.match(/^(Image Upload|رفع الصور):/i)) {
      currentSection = 'image';
      result.imageUploadPrompt = line.replace(/^(Image Upload|رفع الصور):\s*/i, '').trim();
      continue;
    }
    
    // Append to current section
    if (currentSection === 'focus') {
      if (!result.focus) result.focus = line;
      else result.focus += ' ' + line;
    }
    else if (currentSection === 'tasks') {
      if (line.startsWith('-') || line.match(/^\d+\./) || line.length > 0) {
        result.tasks.push(line.replace(/^[-*\d.]\s*/, ''));
      }
    }
    else if (currentSection === 'example') {
      if (!result.example) result.example = line;
      else result.example += ' ' + line;
    }
    else if (currentSection === 'reflection') {
      if (!result.reflectionPrompt) result.reflectionPrompt = line;
      else result.reflectionPrompt += ' ' + line;
    }
    else if (currentSection === 'image') {
      if (!result.imageUploadPrompt) result.imageUploadPrompt = line;
      else result.imageUploadPrompt += ' ' + line;
    }
  }
  
  return result;
}
