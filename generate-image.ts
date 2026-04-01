import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    console.log('Generating image...');
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            text: 'Create a vintage, mystical book cover design inspired by ancient manuscripts. Use a warm sepia and golden-brown color palette with textured parchment background. Include subtle handwritten calligraphy, faded ink sketches, and symbolic geometric diagrams scattered across the background. At the center, place a glossy deep red wax seal with a slightly melted, embossed look, giving a sense of secrecy and importance. The seal should feel realistic and slightly reflective. Add soft glowing light rays or aura behind the seal to create a magical, mysterious atmosphere. Typography should be elegant, handwritten or calligraphy-style, slightly faded, blending naturally with the background. Overall mood: mysterious, ancient wisdom, hidden knowledge, spiritual, minimal yet powerful. Style references: renaissance manuscript, alchemy notes, sacred geometry, old paper textures. Lighting: soft glow, warm highlights, cinematic shadows. high detail, realistic texture, cinematic lighting',
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        fs.mkdirSync('public', { recursive: true });
        fs.writeFileSync('public/bg.png', Buffer.from(base64Data, 'base64'));
        console.log('Image saved to public/bg.png');
      }
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
