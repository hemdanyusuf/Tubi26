import { useEffect, useRef, useState } from 'react';
import { Bot, ChefHat, Refrigerator, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { apiChat } from '../lib/api';
import { getUserId } from '../lib/auth';

type Message = { role: 'user' | 'assistant'; text: string; source?: 'gemini' | 'local' };

const suggestions = [
  { icon: Refrigerator, label: 'Envanterimde neler var?', prompt: 'Envanterimde hangi malzemeler var?' },
  { icon: ChefHat, label: 'Ne pişirebilirim?', prompt: 'Elimdeki malzemelerle ne pişirebilirim?' },
  { icon: Sparkles, label: 'Kalori hedefim nedir?', prompt: 'Günlük kalori hedefim nedir?' },
];

export default function Chat() {
  const userId = getUserId()!;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function send(text = input) {
    const message = text.trim();
    if (!message || loading) return;
    setMessages((current) => [...current, { role: 'user', text: message }]);
    setInput(''); setLoading(true); setError(null);
    try {
      const response = await apiChat(userId, message);
      setMessages((current) => [...current, { role: 'assistant', text: response.text, source: response.source }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Asistan yanıt veremedi.');
    } finally { setLoading(false); }
  }

  return (
    <div className="h-[calc(100vh-9rem)] min-h-[560px] flex flex-col bg-white border border-border-light rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 sm:px-7 py-5 border-b border-border-light flex items-center gap-4 bg-white">
        <div className="relative"><div className="w-11 h-11 rounded-full bg-background-dark text-primary flex items-center justify-center"><Bot className="w-6 h-6" /></div><span className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-white rounded-full" /></div>
        <div><h1 className="font-black text-lg">Tubi26 Mutfak Asistanı</h1><p className="text-xs text-slate-500">Profilini ve envanterini kullanarak yanıt verir</p></div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-5">
          {messages.length === 0 && (
            <div className="min-h-[360px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><Sparkles className="w-8 h-8 text-primary-hover" /></div>
              <h2 className="text-2xl font-black mt-5">Bugün ne hazırlayalım?</h2>
              <p className="text-sm text-slate-500 max-w-lg mt-2">Envanterini sorabilir, yapılabilir bir tarif isteyebilir veya kalori hedefini öğrenebilirsin.</p>
              <div className="grid sm:grid-cols-3 gap-3 mt-7 w-full">
                {suggestions.map(({ icon: Icon, label, prompt }) => <button key={label} onClick={() => void send(prompt)} className="p-4 border border-border-light rounded-xl hover:border-primary hover:bg-primary/5 text-sm font-bold flex items-center justify-center gap-2"><Icon className="w-4 h-4 text-primary-hover" />{label}</button>)}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${message.role === 'user' ? 'bg-primary text-text-dark rounded-br-sm' : 'bg-background-light border border-border-light rounded-bl-sm'}`}>
                {message.role === 'assistant' && <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-wider text-primary-hover"><Bot className="w-3 h-3" />{message.source === 'gemini' ? 'Gemini destekli yanıt' : 'Yerel asistan'}</div>}
                {message.role === 'user' ? <p className="text-sm font-bold">{message.text}</p> : <div className="prose prose-sm max-w-none text-sm"><ReactMarkdown>{message.text}</ReactMarkdown></div>}
              </div>
            </div>
          ))}

          {loading && <div className="flex justify-start"><div className="bg-background-light border border-border-light rounded-2xl rounded-bl-sm px-5 py-4 flex gap-2">{[0, 1, 2].map((value) => <span key={value} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${value * 0.15}s` }} />)}</div></div>}
          {error && <p className="p-3 rounded-xl bg-rose-50 text-rose-600 text-sm font-semibold">{error}</p>}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="p-4 sm:p-5 border-t border-border-light bg-white">
        <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="max-w-4xl mx-auto flex gap-3 relative">
          <input maxLength={1000} value={input} onChange={(event) => setInput(event.target.value)} disabled={loading} placeholder="Tarif veya envanter hakkında sor..." className="w-full rounded-full bg-background-light border border-border-light py-4 pl-6 pr-16 focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
          <button disabled={loading || !input.trim()} aria-label="Mesaj gönder" className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-primary hover:bg-primary-hover flex items-center justify-center disabled:opacity-50"><Send className="w-4 h-4" /></button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2">Yanıtlar bilgilendirme amaçlıdır; tıbbi tavsiye değildir.</p>
      </div>
    </div>
  );
}
