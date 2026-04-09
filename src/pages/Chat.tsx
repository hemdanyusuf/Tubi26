import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, Plus, X, UtensilsCrossed, Flame, Utensils } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Initialize with Vite environment variable
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSy_YOUR_API_KEY_HERE' });

type Message = {
  role: 'user' | 'model';
  text: string;
};

export default function Chat() {
  const [ingredients, setIngredients] = useState<string[]>(['Tavuk', 'Pirinç', 'Domates']);
  const [newIngredient, setNewIngredient] = useState('');
  const [calories, setCalories] = useState<number>(500);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const context = `[SİSTEM BİLGİSİ: Kullanıcının elindeki malzemeler: ${ingredients.length > 0 ? ingredients.join(', ') : 'Yok'}. Hedeflenen maksimum kalori: ${calories} kcal.]\n\n`;
      const prompt = context + userMessage;
      
      const contents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: prompt }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: "Sen uzman bir aşçı ve diyetisyensin. Kullanıcıya elindeki malzemeleri kullanarak ve kalori hedefine uyarak lezzetli, pratik yemek tarifleri sun. Tariflerin adım adım hazırlanışını ve tahmini kalori değerini belirt.",
        }
      });

      setMessages((prev) => [...prev, { role: 'model', text: response.text || '' }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'model', text: 'Üzgünüm, bir hata oluştu veya API Anahtarı eksik. Lütfen kontrol edin.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-screen w-full bg-background-light p-4 md:p-8 gap-6 font-sans">
      {/* Sidebar: Preferences */}
      <div className="w-full md:w-1/3 max-w-sm flex flex-col gap-6 shrink-0 h-full overflow-y-auto custom-scrollbar">
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#e7f3eb] flex flex-col overflow-hidden">
          <div className="p-6 pb-4 border-b border-[#e7f3eb]">
            <h2 className="flex items-center gap-2 text-xl font-black tracking-tighter text-text-dark">
              <span className="material-symbols-outlined text-primary text-2xl">restaurant_menu</span>
              Şefin Mutfağı
            </h2>
            <p className="text-sm text-text-muted-light mt-1 font-medium">Elindeki malzemeleri ve kalori hedefini belirle, sana özel tarifler sunayım.</p>
          </div>
          <div className="p-6 flex flex-col gap-8">
            {/* Calories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-text-dark">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Maksimum Kalori
                </label>
                <span className="text-sm font-black text-orange-600">{calories} kcal</span>
              </div>
              <input
                type="range"
                min={100}
                max={2000}
                step={50}
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full h-2 bg-[#e7f3eb] rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            <div className="h-px bg-[#e7f3eb] w-full" />

            {/* Ingredients */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-text-dark">
                <Utensils className="w-4 h-4 text-text-muted-light" />
                Malzemeler
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Malzeme ekle..."
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-[#e7f3eb]/40 border border-[#e7f3eb] rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary text-text-dark"
                />
                <button 
                  onClick={addIngredient} 
                  className="w-10 h-10 shrink-0 bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {ingredients.map((ing) => (
                  <span key={ing} className="bg-white border border-[#e7f3eb] shadow-sm text-xs font-extrabold text-text-dark px-3 py-1.5 rounded-full flex items-center gap-2">
                    {ing}
                    <button
                      onClick={() => removeIngredient(ing)}
                      className="text-text-muted-light hover:text-red-500 transition-colors p-0.5 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {ingredients.length === 0 && (
                  <span className="text-xs text-text-muted-light italic font-medium">Henüz malzeme eklenmedi.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#e7f3eb] overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-[#e7f3eb] bg-[#f6f8f6]/50 flex shrink-0 items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">smart_toy</span>
            </div>
            <div>
                <h3 className="text-lg font-black text-text-dark tracking-tight">Tarif Asistanı</h3>
                <p className="text-xs font-semibold text-text-muted-light">Bana elindeki malzemelerle ne yapabileceğini sor.</p>
            </div>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar" ref={scrollRef}>
          <div className="flex flex-col gap-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12 mt-10">
                <div className="w-20 h-20 bg-[#e7f3eb] rounded-2xl flex items-center justify-center mb-6 rotate-12 transition-transform hover:rotate-0 shadow-sm border border-[#e7f3eb]">
                  <UtensilsCrossed className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-black text-text-dark mb-2">Merhaba! Ben kişisel aşçınım.</h3>
                <p className="text-sm text-text-muted-light max-w-sm font-medium">
                  Sol taraftan malzemelerini ve kalori hedefini ayarladıktan sonra bana yazabilirsin. Örneğin: "Bana bol proteinli bir diyet yemeği verir misin?"
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-[#0d1b12] rounded-br-[4px]'
                        : 'bg-[#f6f8f6] border border-[#e7f3eb] text-[#0d1b12] rounded-bl-[4px]'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-sm font-bold">{msg.text}</p>
                    ) : (
                      <div className="prose prose-sm prose-zinc max-w-none 
                        prose-headings:text-text-dark prose-headings:font-black 
                        prose-p:font-medium prose-p:text-[#223d2b]
                        prose-strong:font-black prose-strong:text-text-dark
                        prose-li:text-sm prose-ul:my-2 prose-ol:my-2">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#f6f8f6] border border-[#e7f3eb] rounded-2xl rounded-bl-[4px] px-5 py-4 flex items-center gap-2.5">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-white border-t border-[#e7f3eb] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-3 relative max-w-4xl mx-auto items-center"
          >
            <input
              type="text"
              placeholder="Tarif iste..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-full bg-[#f6f8f6] border border-[#e7f3eb] py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-primary shadow-inner text-text-dark font-medium"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="absolute right-2 shrink-0 rounded-full w-10 h-10 bg-primary hover:bg-[#10c94d] text-[#0d1b12] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
