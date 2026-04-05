import { useState } from 'react';
import { Lightbulb, Leaf, Drumstick, Droplet, GlassWater, Beef, Egg, Search, Plus, Bell, Settings } from 'lucide-react';
import { clsx } from 'clsx';

export default function Shopping() {
  return (
    <div className="w-full h-full pb-32">
      {/* Top Banner section similar to TopNavBar inside Shopping for contextual header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="font-black text-3xl tracking-tighter text-text-dark">Alışveriş Listem</h2>
          <p className="text-text-muted-light font-bold text-sm tracking-wide uppercase mt-1">
             3 Tarif • 12 Eksik Malzeme
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="hidden lg:flex items-center bg-white rounded-full px-4 py-2 w-64 border border-border-light shadow-sm">
            <Search className="text-text-muted-light w-5 h-5" />
            <input 
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full font-medium ml-2 text-text-dark placeholder-text-muted-light" 
              placeholder="Ürün Ara..." 
              type="text"
            />
          </div>
          <button className="hidden sm:flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-extrabold text-xs uppercase tracking-widest hover:opacity-80 transition-all shadow-lg shadow-primary/30">
            <Plus className="w-4 h-4" />
            Malzeme Ekle
          </button>
        </div>
      </div>

      {/* Info Banner (Tonal Layering) */}
      <div className="mb-10 bg-border-light rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 border border-primary/20">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0">
          <Lightbulb className="text-primary w-8 h-8 flex-shrink-0" fill="currentColor" />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-lg tracking-tight text-text-dark">Akıllı Öneriler</h3>
          <p className="text-text-muted-light text-sm leading-relaxed max-w-2xl mt-1">
            Şu an listenizde 3 tariften gelen 12 eksik malzeme bulunuyor. <strong className="text-text-dark">"Fırın Somon"</strong> tarifi için tüm malzemeleri tamamlamaya sadece 2 ürün kaldı!
          </p>
        </div>
        <button className="px-6 py-3 bg-text-dark text-white rounded-xl font-bold text-sm whitespace-nowrap hover:bg-text-dark/90 transition-colors">
          Tarifleri İncele
        </button>
      </div>

      {/* Bento Grid for Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Category: Sebzeler (Large Block) */}
        <section className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <Leaf className="text-primary w-6 h-6" fill="currentColor" />
              <h4 className="font-black text-xl tracking-tight uppercase text-text-dark">Sebzeler</h4>
            </div>
            <span className="px-3 py-1 bg-border-light text-text-muted-light text-[10px] font-black rounded-full uppercase tracking-widest">
              4 Madde
            </span>
          </div>
          
          <div className="bg-surface-light rounded-2xl border border-border-light shadow-[0_10px_30px_-10px_rgba(19,236,91,0.05)] overflow-hidden">
            {/* Item 1 */}
            <div className="p-4 flex items-center gap-4 hover:bg-border-light/50 transition-colors border-b border-border-light">
              <div className="relative flex items-center justify-center">
                <input className="w-6 h-6 rounded-lg border-2 border-primary/40 text-primary focus:ring-primary/20 cursor-pointer accent-primary" type="checkbox" />
              </div>
              <div className="flex-1">
                <span className="block font-bold text-text-dark">Organik Baby Ispanak</span>
                <span className="text-[10px] font-black text-text-muted-light uppercase tracking-wider mt-0.5 block">Fırın Mücver Tarifi İçin</span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="block font-black text-primary">500g</span>
                <span className="text-[10px] text-orange-500 uppercase font-black tracking-tighter bg-orange-100 px-2 py-0.5 rounded-full mt-1">Aciliyet: Orta</span>
              </div>
            </div>
            
            {/* Item 2 */}
            <div className="p-4 flex items-center gap-4 hover:bg-border-light/50 transition-colors border-b border-border-light">
              <div className="relative flex items-center justify-center">
                <input className="w-6 h-6 rounded-lg border-2 border-primary/40 text-primary focus:ring-primary/20 cursor-pointer accent-primary" type="checkbox" />
              </div>
              <div className="flex-1">
                <span className="block font-bold text-text-dark">Cherry Domates</span>
                <span className="text-[10px] font-black text-text-muted-light uppercase tracking-wider mt-0.5 block">Akdeniz Salatası İçin</span>
              </div>
              <div className="text-right">
                <span className="block font-black text-primary">2 Paket</span>
              </div>
            </div>
            
            {/* Item 3 */}
            <div className="p-4 flex items-center gap-4 hover:bg-border-light/50 transition-colors border-b border-border-light">
              <div className="relative flex items-center justify-center opacity-70">
                <input defaultChecked className="w-6 h-6 rounded-lg border-2 border-primary/40 text-primary focus:ring-primary/20 cursor-pointer accent-primary" type="checkbox" />
              </div>
              <div className="flex-1 opacity-40 italic">
                <span className="block font-bold text-text-dark line-through">Avokado (Yumuşak)</span>
                <span className="text-[10px] font-black uppercase tracking-wider mt-0.5 block text-text-dark">Smoothie Kasesi İçin</span>
              </div>
              <div className="text-right opacity-40">
                <span className="block font-black text-text-dark">2 Adet</span>
              </div>
            </div>

            {/* Item 4 */}
            <div className="p-4 flex items-center gap-4 hover:bg-border-light/50 transition-colors">
              <div className="relative flex items-center justify-center">
                <input className="w-6 h-6 rounded-lg border-2 border-primary/40 text-primary focus:ring-primary/20 cursor-pointer accent-primary" type="checkbox" />
              </div>
              <div className="flex-1">
                <span className="block font-bold text-text-dark">Kırmızı Kapya Biber</span>
                <span className="text-[10px] font-black text-text-muted-light uppercase tracking-wider mt-0.5 block">Genel İhtiyaç</span>
              </div>
              <div className="text-right">
                <span className="block font-black text-primary">3 Adet</span>
              </div>
            </div>
          </div>
        </section>

        {/* Category: Proteinler (Tall Block) */}
        <section className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <Drumstick className="text-primary w-6 h-6" fill="currentColor" />
              <h4 className="font-black text-xl tracking-tight uppercase text-text-dark">Proteinler</h4>
            </div>
          </div>
          
          <div className="bg-surface-light rounded-2xl border border-border-light shadow-[0_10px_30px_-10px_rgba(19,236,91,0.05)] divide-y divide-border-light overflow-hidden flex flex-col h-full">
            <div className="p-6 pb-5">
              <div className="w-full h-32 rounded-xl mb-4 overflow-hidden relative group">
                <img 
                  alt="Somon" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  src="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop" 
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur rounded text-[10px] font-black uppercase text-red-600">Önemli</div>
              </div>
              <div className="flex items-start justify-between mb-2 gap-2">
                <div>
                  <h5 className="font-black text-text-dark leading-tight">Taze Somon Fleto</h5>
                  <p className="text-[10px] font-black text-text-muted-light uppercase tracking-wider mt-1">Fırın Somon Tarifi</p>
                </div>
                <span className="font-black text-primary text-sm whitespace-nowrap bg-primary/10 px-2 py-1 rounded-md">400g</span>
              </div>
              <label className="flex items-center gap-2 mt-4 cursor-pointer hover:bg-border-light p-2 -mx-2 rounded-lg transition-colors">
                <input className="w-5 h-5 rounded border-2 border-primary/40 text-primary accent-primary" type="checkbox" />
                <span className="text-xs font-bold text-text-dark">Siparişe Ekle</span>
              </label>
            </div>
            
            <div className="p-6 pt-5">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div>
                  <h5 className="font-black text-text-dark leading-tight">Serbest Gezen Tavuk Göğsü</h5>
                  <p className="text-[10px] font-black text-text-muted-light uppercase tracking-wider mt-1">Izgara Tavuk Salatası</p>
                </div>
                <span className="font-black text-primary text-sm whitespace-nowrap bg-primary/10 px-2 py-1 rounded-md">600g</span>
              </div>
              <label className="flex items-center gap-2 mt-4 cursor-pointer hover:bg-border-light p-2 -mx-2 rounded-lg transition-colors">
                <input className="w-5 h-5 rounded border-2 border-primary/40 text-primary accent-primary" type="checkbox" />
                <span className="text-xs font-bold text-text-dark">Siparişe Ekle</span>
              </label>
            </div>
          </div>
        </section>

        {/* Category: Süt Ürünleri (Horizontal Block) */}
        <section className="lg:col-span-12 space-y-4 mt-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <Droplet className="text-primary w-6 h-6" fill="currentColor" />
              <h4 className="font-black text-xl tracking-tight uppercase text-text-dark">Süt Ürünleri & Alternatifler</h4>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Item Card 1 */}
            <label className="bg-surface-light p-5 rounded-2xl border border-border-light hover:border-primary/40 transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-border-light rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <GlassWater className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-text-dark leading-tight">Badem Sütü (Şekersiz)</p>
                  <p className="text-[10px] font-black text-text-muted-light uppercase tracking-wider mt-1">Kahvaltı Smoothie</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-black text-primary">1L</span>
                <input className="w-5 h-5 rounded border-2 border-primary/40 text-primary accent-primary cursor-pointer" type="checkbox" />
              </div>
            </label>

            {/* Item Card 2 */}
            <label className="bg-surface-light p-5 rounded-2xl border border-border-light hover:border-primary/40 transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between group opacity-60">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-border-light rounded-xl flex items-center justify-center shrink-0">
                  <Beef className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-text-dark leading-tight line-through">Yunan Yoğurdu</p>
                  <p className="text-[10px] font-black text-text-muted-light uppercase tracking-wider mt-1">Ara Öğün</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-black text-text-dark opacity-50">500g</span>
                <input defaultChecked className="w-5 h-5 rounded border-2 border-primary/40 text-primary accent-primary cursor-pointer" type="checkbox" />
              </div>
            </label>

            {/* Item Card 3 */}
            <label className="bg-surface-light p-5 rounded-2xl border border-border-light hover:border-primary/40 transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-border-light rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Egg className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-text-dark leading-tight">Organik Yumurta</p>
                  <p className="text-[10px] font-black text-text-muted-light uppercase tracking-wider mt-1">Haftalık Stok</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-black text-primary">15'li</span>
                <input className="w-5 h-5 rounded border-2 border-primary/40 text-primary accent-primary cursor-pointer" type="checkbox" />
              </div>
            </label>
          </div>
        </section>
      </div>

      {/* Floating Action Button (Mobile only) */}
      <button className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-40 active:scale-90 transition-transform">
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
