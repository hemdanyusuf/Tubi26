/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Send, Plus, X, ChefHat, Flame, Utensils } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type Message = {
  role: 'user' | 'model';
  text: string;
};

export default function App() {
  const [ingredients, setIngredients] = useState<string[]>(['Tavuk', 'Pirinç', 'Domates']);
  const [newIngredient, setNewIngredient] = useState('');
  const [calories, setCalories] = useState<number[]>([500]);
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
      const context = `[SİSTEM BİLGİSİ: Kullanıcının elindeki malzemeler: ${ingredients.length > 0 ? ingredients.join(', ') : 'Yok'}. Hedeflenen maksimum kalori: ${calories[0]} kcal.]\n\n`;
      const prompt = context + userMessage;
      
      const contents = messages.map(msg => ({
        role: msg.role,
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
      setMessages((prev) => [...prev, { role: 'model', text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 p-4 md:p-8 gap-6 font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 max-w-sm flex flex-col gap-6">
        <Card className="shadow-sm border-zinc-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-zinc-800">
              <ChefHat className="w-5 h-5 text-orange-500" />
              Şefin Mutfağı
            </CardTitle>
            <CardDescription>
              Elindeki malzemeleri ve kalori hedefini belirle, sana özel tarifler sunayım.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Calories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2 text-zinc-700">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Maksimum Kalori
                </label>
                <span className="text-sm font-bold text-orange-600">{calories[0]} kcal</span>
              </div>
              <Slider
                value={calories}
                onValueChange={(val) => setCalories(val as number[])}
                max={2000}
                min={100}
                step={50}
                className="py-2"
              />
            </div>

            <Separator />

            {/* Ingredients */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2 text-zinc-700">
                <Utensils className="w-4 h-4 text-zinc-500" />
                Malzemeler
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Malzeme ekle..."
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button onClick={addIngredient} size="icon" variant="secondary">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {ingredients.map((ing) => (
                  <Badge key={ing} variant="outline" className="bg-white flex items-center gap-1 pl-2 pr-1 py-1">
                    {ing}
                    <button
                      onClick={() => removeIngredient(ing)}
                      className="text-zinc-400 hover:text-red-500 transition-colors rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {ingredients.length === 0 && (
                  <span className="text-sm text-zinc-400 italic">Henüz malzeme eklenmedi.</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col shadow-sm border-zinc-200 overflow-hidden">
        <CardHeader className="border-b border-zinc-100 bg-white/50 pb-4">
          <CardTitle className="text-lg text-zinc-800">Tarif Asistanı</CardTitle>
          <CardDescription>Bana ne yemek istediğini veya elindeki malzemelerle ne yapabileceğini sor.</CardDescription>
        </CardHeader>
        
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500 gap-4 mt-20">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <ChefHat className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-zinc-700">Merhaba! Ben senin kişisel aşçınım.</p>
                  <p className="text-sm mt-1">Sol taraftan malzemelerini ve kalori hedefini ayarladıktan sonra bana yazabilirsin. Örneğin: "Bana pratik bir akşam yemeği önerir misin?"</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-zinc-900 text-white rounded-br-sm'
                        : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-sm">{msg.text}</p>
                    ) : (
                      <div className="prose prose-sm prose-zinc max-w-none">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-zinc-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-white border-t border-zinc-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Tarif iste..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-full bg-zinc-50 border-zinc-200 focus-visible:ring-orange-500"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="rounded-full w-10 h-10 p-0 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

