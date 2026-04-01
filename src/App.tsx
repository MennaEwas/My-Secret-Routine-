import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, Send, BookOpen, Heart, Moon, Sun, Feather, ImagePlus, X } from 'lucide-react';
import { challengeData } from './data/challengeData';
import { getDayContent, getCoachResponse, parseGeminiDayResponse } from './lib/gemini';

export default function App() {
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [language, setLanguage] = useState<"EN" | "AR">("EN");
  const [reflection, setReflection] = useState('');
  const [coachResponse, setCoachResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDay, setIsLoadingDay] = useState(false);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [dayData, setDayData] = useState<any>(null);
  const [uploadedImages, setUploadedImages] = useState<{url: string, base64: string, mimeType: string}[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('secretCompletedDays');
    if (saved) {
      try {
        setCompletedDays(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (isBookOpen) {
      fetchDayData(currentDay, language);
    }
  }, [currentDay, language, isBookOpen]);

  const fetchDayData = async (day: number, lang: "EN" | "AR") => {
    setIsLoadingDay(true);
    setCoachResponse('');
    setReflection('');
    setUploadedImages([]);
    
    const rawContent = await getDayContent(day, lang);
    if (rawContent) {
      const parsed = parseGeminiDayResponse(rawContent, day);
      setDayData(parsed);
    } else {
      const fallback = challengeData.find((d) => d.day === day) || challengeData[0];
      setDayData({
        ...fallback,
        imageUploadPrompt: [6, 8, 10, 12, 27].includes(day) ? (lang === "AR" ? "قم برفع صور تعبر عن هدفك (مثل العمل، السفر، نمط الحياة)" : "Upload images that represent your goal (e.g., dream job, travel, lifestyle)") : ""
      });
    }
    setIsLoadingDay(false);
  };

  const handleDaySelect = (day: number) => {
    if (day !== currentDay) {
      setCurrentDay(day);
    }
  };

  const handleLanguageToggle = () => {
    setLanguage(prev => prev === "EN" ? "AR" : "EN");
  };

  const handleSubmit = async () => {
    if (!reflection.trim()) return;
    
    setIsSubmitting(true);
    const imagesForGemini = uploadedImages.map(img => ({
      data: img.base64.split(',')[1],
      mimeType: img.mimeType
    }));
    const response = await getCoachResponse(currentDay, reflection, language, imagesForGemini);
    setCoachResponse(response);
    setIsSubmitting(false);

    if (!completedDays.includes(currentDay)) {
      const newCompleted = [...completedDays, currentDay];
      setCompletedDays(newCompleted);
      localStorage.setItem('secretCompletedDays', JSON.stringify(newCompleted));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const newImages = await Promise.all(files.map(async (file) => {
        const url = URL.createObjectURL(file);
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        return { url, base64, mimeType: file.type };
      }));
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!isBookOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden cursor-pointer" onClick={() => setIsBookOpen(true)}>
        {/* Background Calligraphy & Geometry */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-10 left-10 text-4xl faded-script text-amber-900">As above, so below...</div>
          <div className="absolute bottom-20 right-20 text-5xl faded-script text-amber-900">The universe provides...</div>
          <div className="absolute top-1/4 right-1/4 text-3xl faded-script text-amber-900">Thoughts become things...</div>
          <div className="absolute bottom-1/3 left-1/4 text-4xl faded-script text-amber-900">Ask, Believe, Receive...</div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-amber-900/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-amber-900/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-amber-900/10 rotate-45"></div>
        </div>

        {/* Center Seal & Title */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-5xl md:text-7xl text-amber-950 tracking-widest uppercase mb-4 drop-shadow-sm">
              The Secret
            </h1>
            <p className="font-serif text-xl md:text-2xl text-amber-800 italic tracking-wide">
              A 30-Day Journey of Manifestation
            </p>
          </motion.div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] glow-rays rounded-full pointer-events-none z-0"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/20 blur-[50px] rounded-full pointer-events-none z-0"></div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 w-32 h-32 rounded-full wax-seal flex items-center justify-center cursor-pointer group"
          >
            <div className="w-28 h-28 rounded-full wax-seal-inner flex items-center justify-center">
              <Feather className="w-12 h-12 text-red-100 opacity-80 drop-shadow-md" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-8 text-amber-900 font-serif italic opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Break the seal
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const isRTL = language === 'AR';

  return (
    <div className="min-h-screen text-amber-950 font-serif selection:bg-amber-900/30 relative" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
        <div className="absolute top-5 left-5 text-2xl faded-script text-amber-900">Gratitude...</div>
        <div className="absolute bottom-5 right-5 text-2xl faded-script text-amber-900">Alignment...</div>
      </div>

      <header className="border-b border-amber-900/20 bg-[#d4c4a8]/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsBookOpen(false)}>
            <div className="w-8 h-8 rounded-full wax-seal flex items-center justify-center scale-75 origin-left">
              <div className="w-6 h-6 rounded-full wax-seal-inner flex items-center justify-center">
                <Feather className="w-3 h-3 text-red-100 opacity-80" strokeWidth={2} />
              </div>
            </div>
            <h1 className="text-xl font-display font-semibold tracking-widest text-amber-950 uppercase">
              {isRTL ? 'السر' : 'The Secret'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLanguageToggle}
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-amber-900/20 bg-[#e2d5bd]/50 hover:bg-[#e2d5bd] transition-colors text-sm font-display tracking-wider text-amber-900"
            >
              {language === 'EN' ? '🇬🇧 English' : '🇸🇦 العربية'}
            </button>
            <div className="text-sm font-serif italic text-amber-800 bg-amber-900/5 px-4 py-1.5 rounded-full border border-amber-900/10 hidden sm:block">
              {completedDays.length} / 30 {isRTL ? 'أيام مكتملة' : 'Days Completed'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-[#e2d5bd]/50 border border-amber-900/20 rounded-sm p-6 shadow-[inset_0_0_20px_rgba(139,69,19,0.05)]">
            <h2 className="text-xl font-display mb-6 flex items-center gap-2 text-amber-900 uppercase tracking-widest border-b border-amber-900/20 pb-2">
              <Sun className="w-5 h-5 text-amber-700" />
              {isRTL ? 'الرحلة' : 'The Journey'}
            </h2>
            <div className="grid grid-cols-5 gap-3">
              {challengeData.map((d) => {
                const isCompleted = completedDays.includes(d.day);
                const isActive = currentDay === d.day;
                return (
                  <button
                    key={d.day}
                    onClick={() => handleDaySelect(d.day)}
                    className={`
                      relative aspect-square rounded-sm flex items-center justify-center text-lg font-serif transition-all duration-300
                      ${isActive 
                        ? 'bg-amber-900 text-[#d4c4a8] shadow-md scale-110 z-10 border border-amber-950' 
                        : isCompleted 
                          ? 'bg-amber-800/20 text-amber-900 hover:bg-amber-800/30 border border-amber-900/30' 
                          : 'bg-transparent text-amber-800/70 hover:bg-amber-900/10 border border-amber-900/10'}
                    `}
                  >
                    {d.day}
                    {isCompleted && !isActive && (
                      <div className={`absolute -top-1 ${isRTL ? '-left-1' : '-right-1'} w-2.5 h-2.5 bg-green-700/80 rounded-full border border-[#d4c4a8]`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9">
          <AnimatePresence mode="wait">
            {isLoadingDay ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 space-y-4"
              >
                <div className="w-12 h-12 border-4 border-amber-900/20 border-t-amber-900 rounded-full animate-spin" />
                <p className="text-amber-800 font-serif italic">
                  {isRTL ? 'جاري استحضار الحكمة...' : 'Summoning wisdom...'}
                </p>
              </motion.div>
            ) : dayData ? (
              <motion.div
                key={currentDay + language}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-8"
              >
                <div className="bg-[#e2d5bd]/60 border border-amber-900/20 rounded-sm p-8 md:p-12 shadow-[0_10px_30px_rgba(89,60,31,0.1),inset_0_0_40px_rgba(139,69,19,0.05)] relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-sm bg-amber-900/10 border border-amber-900/20 text-amber-900 text-sm font-display tracking-widest uppercase mb-8">
                      {isRTL ? 'اليوم' : 'Day'} {dayData.day}
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-display mb-10 text-amber-950 leading-tight">
                      <span className="text-amber-700 text-lg block mb-3 font-serif italic tracking-normal normal-case">
                        {isRTL ? 'التركيز الأساسي' : "Today's Focus"}
                      </span>
                      {dayData.focus}
                    </h2>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-display text-amber-900 mb-5 flex items-center gap-2 uppercase tracking-widest border-b border-amber-900/20 pb-2">
                            <CheckCircle2 className="w-5 h-5" />
                            {isRTL ? 'المهام' : 'Tasks'}
                          </h3>
                          <ul className="space-y-4">
                            {dayData.tasks.map((task: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-4">
                                <div className="w-6 h-6 rounded-full border border-amber-900/40 flex items-center justify-center flex-shrink-0 text-sm font-display text-amber-800 mt-0.5">
                                  {idx + 1}
                                </div>
                                <span className="text-amber-950 text-lg leading-relaxed">{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-amber-900/5 border border-amber-900/10 rounded-sm p-6 relative">
                          <div className={`absolute -top-3 ${isRTL ? '-right-2' : '-left-2'} text-4xl text-amber-900/20 font-serif`}>"</div>
                          <h3 className="text-sm font-display text-amber-700 mb-3 flex items-center gap-2 uppercase tracking-widest">
                            <BookOpen className="w-4 h-4" />
                            {isRTL ? 'مثال' : 'Example'}
                          </h3>
                          <p className="text-amber-900 text-lg italic leading-relaxed relative z-10">{dayData.example}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {dayData.imageUploadPrompt && (
                  <div className="bg-[#e2d5bd]/60 border border-amber-900/20 rounded-sm p-8 md:p-10 shadow-[0_5px_20px_rgba(89,60,31,0.05)]">
                    <h3 className="text-2xl font-display text-amber-950 mb-3 flex items-center gap-2 uppercase tracking-widest">
                      <ImagePlus className="w-6 h-6 text-amber-700" />
                      {isRTL ? 'رفع الصور' : 'Image Upload'}
                    </h3>
                    <p className="text-amber-800 text-lg italic mb-6">{dayData.imageUploadPrompt}</p>
                    
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-4">
                        {uploadedImages.map((img, idx) => (
                          <div key={idx} className="relative w-32 h-32 rounded-sm border-2 border-amber-900/20 overflow-hidden group">
                            <img src={img.url} alt="Vision board" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-red-900/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <label className="w-32 h-32 rounded-sm border-2 border-dashed border-amber-900/30 flex flex-col items-center justify-center text-amber-800/60 hover:bg-amber-900/5 hover:border-amber-900/50 transition-colors cursor-pointer">
                          <ImagePlus className="w-8 h-8 mb-2" />
                          <span className="text-sm font-display uppercase">{isRTL ? 'إضافة صورة' : 'Add Image'}</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-[#e2d5bd]/60 border border-amber-900/20 rounded-sm p-8 md:p-10 shadow-[0_5px_20px_rgba(89,60,31,0.05)]">
                  <h3 className="text-2xl font-display text-amber-950 mb-3 flex items-center gap-2 uppercase tracking-widest">
                    <Moon className="w-6 h-6 text-amber-700" />
                    {isRTL ? 'تأمل' : 'Reflection'}
                  </h3>
                  <p className="text-amber-800 text-lg italic mb-6">{dayData.reflectionPrompt}</p>
                  
                  <div className="space-y-6">
                    <textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder={isRTL ? 'اكتب أفكارك هنا...' : 'Write your thoughts here...'}
                      className="w-full h-40 bg-[#d4c4a8]/50 border border-amber-900/30 rounded-sm p-5 text-amber-950 text-lg placeholder-amber-900/40 focus:outline-none focus:border-amber-900/60 focus:bg-[#e2d5bd]/80 resize-none transition-all font-serif leading-relaxed"
                    />
                    
                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmit}
                        disabled={!reflection.trim() || isSubmitting}
                        className="flex items-center gap-2 bg-amber-900 hover:bg-amber-800 disabled:bg-amber-900/30 disabled:text-amber-900/50 text-[#d4c4a8] px-8 py-3 rounded-sm font-display tracking-widest uppercase transition-all shadow-md"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-[#d4c4a8]/30 border-t-[#d4c4a8] rounded-full animate-spin" />
                        ) : (
                          <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                        )}
                        {isSubmitting ? (isRTL ? 'جاري الإرسال...' : 'Reflecting...') : (isRTL ? 'ختم الإدخال' : 'Seal Entry')}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {coachResponse && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-amber-50 border border-amber-900/20 rounded-sm p-8 relative shadow-inner">
                          <Sparkles className={`absolute top-8 ${isRTL ? 'left-8' : 'right-8'} w-6 h-6 text-amber-400/60`} />
                          <h4 className="text-sm font-display text-amber-700 mb-3 uppercase tracking-widest">
                            {isRTL ? 'حكمة متلقاة' : 'Wisdom Received'}
                          </h4>
                          <p className={`text-amber-950 text-xl italic leading-relaxed ${isRTL ? 'pl-10' : 'pr-10'}`}>{coachResponse}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
