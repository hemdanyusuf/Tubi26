import React from 'react';

export default function AddIngredient() {
  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen" style={{ backgroundColor: '#f6f8f6' }}>
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-black tracking-tighter text-[#0d1b12]">Yeni Malzeme Ekle</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: The Form */}
        <div className="lg:col-span-8">
          <section className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#e7f3eb]">
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              {/* Ingredient Name */}
              <div className="relative">
                <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#4c9a66] mb-3">Malzeme Adı</label>
                <div className="flex items-center gap-3 bg-[#e7f3eb]/40 rounded-xl p-4 ring-1 ring-inset ring-[#e7f3eb] focus-within:ring-2 focus-within:ring-[#13ec5b] transition-all">
                  <span className="material-symbols-outlined text-[#4c9a66]">restaurant</span>
                  <input 
                    type="text" 
                    className="bg-transparent border-none focus:ring-0 w-full font-semibold text-lg text-[#0d1b12] placeholder:text-[#a0aec0] outline-none" 
                    placeholder="Örn: Avokado, Taze Nane..." 
                  />
                </div>
                <div className="flex flex-wrap gap-2 py-3 mt-1">
                  <span className="bg-[#e7f3eb]/40 text-[10px] text-[#0d1b12] font-extrabold py-1.5 px-3 rounded-full border border-[#e7f3eb] cursor-pointer hover:bg-[#13ec5b]/10 hover:text-[#0d1b12] hover:border-[#13ec5b]/30 transition-colors uppercase">DOMATES</span>
                  <span className="bg-[#e7f3eb]/40 text-[10px] text-[#0d1b12] font-extrabold py-1.5 px-3 rounded-full border border-[#e7f3eb] cursor-pointer hover:bg-[#13ec5b]/10 hover:text-[#0d1b12] hover:border-[#13ec5b]/30 transition-colors uppercase">SALATALIK</span>
                  <span className="bg-[#e7f3eb]/40 text-[10px] text-[#0d1b12] font-extrabold py-1.5 px-3 rounded-full border border-[#e7f3eb] cursor-pointer hover:bg-[#13ec5b]/10 hover:text-[#0d1b12] hover:border-[#13ec5b]/30 transition-colors uppercase">TAVUK GÖĞSÜ</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#4c9a66] mb-3">Kategori</label>
                  <div className="relative">
                    <select className="w-full bg-[#e7f3eb]/40 border border-[#e7f3eb] rounded-xl p-4 font-bold text-sm text-[#0d1b12] focus:ring-2 focus:ring-[#13ec5b] appearance-none cursor-pointer outline-none">
                      <option>Sebzeler</option>
                      <option>Proteinler</option>
                      <option>Süt Ürünleri</option>
                      <option>Tahıllar</option>
                      <option>Meyveler</option>
                      <option>Baharatlar</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#4c9a66] pointer-events-none">expand_more</span>
                  </div>
                </div>
                {/* Location Toggle */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#4c9a66] mb-3">Konum</label>
                  <div className="flex bg-[#e7f3eb]/40 p-1.5 rounded-xl gap-1 border border-[#e7f3eb]">
                    <button type="button" className="flex-1 bg-[#13ec5b] text-[#0d1b12] py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">ENVANTER</button>
                    <button type="button" className="flex-1 text-[#4c9a66] font-bold py-2.5 rounded-lg text-[10px] uppercase tracking-widest hover:bg-white/60 transition-colors">ALIŞVERİŞ LİSTESİ</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Quantity */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#4c9a66] mb-3">Miktar</label>
                  <div className="flex items-center bg-[#e7f3eb]/40 rounded-xl overflow-hidden border border-[#e7f3eb]">
                    <button type="button" className="px-5 py-3 hover:bg-[#13ec5b]/10 text-[#4c9a66] transition-colors font-black">
                      <span className="material-symbols-outlined text-[#13ec5b]">remove</span>
                    </button>
                    <input 
                      type="number" 
                      className="bg-transparent border-none focus:ring-0 w-full text-center font-black text-xl text-[#0d1b12] outline-none" 
                      defaultValue="1" 
                    />
                    <button type="button" className="px-5 py-3 hover:bg-[#13ec5b]/10 text-[#4c9a66] transition-colors font-black">
                      <span className="material-symbols-outlined text-[#13ec5b]">add</span>
                    </button>
                  </div>
                </div>
                {/* Unit */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#4c9a66] mb-3">Birim</label>
                  <div className="relative">
                    <select className="w-full bg-[#e7f3eb]/40 border border-[#e7f3eb] rounded-xl p-4 font-bold text-sm text-[#0d1b12] focus:ring-2 focus:ring-[#13ec5b] appearance-none cursor-pointer outline-none">
                      <option>adet</option>
                      <option>kg</option>
                      <option>g</option>
                      <option>paket</option>
                      <option>litre</option>
                      <option>demet</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#4c9a66] pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full bg-[#13ec5b] text-[#0d1b12] font-black py-4 rounded-xl shadow-[0_8px_20px_-6px_rgba(19,236,91,0.4)] hover:scale-[1.01] active:scale-[0.98] transition-transform text-sm tracking-tight uppercase">
                  MALZEMEYİ KAYDET
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right Column: Frequent Items & Recently Added */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recently Added Card */}
          <section className="bg-white rounded-xl overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#e7f3eb]">
            <div className="p-4 bg-transparent border-b border-[#e7f3eb]">
              <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#4c9a66]">Son Eklenenler</h3>
            </div>
            <div className="divide-y divide-[#e7f3eb]">
              <div className="p-4 flex items-center gap-4 hover:bg-[#f6f8f6] transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-[#e7f3eb]/50 flex items-center justify-center text-[#13ec5b] group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">eco</span>
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-sm text-[#0d1b12]">Kinoa</p>
                  <p className="text-[9px] font-extrabold text-[#a0aec0] uppercase tracking-widest mt-0.5">500 G • TAHILLAR</p>
                </div>
              </div>
              <div className="p-4 flex items-center gap-4 hover:bg-[#f6f8f6] transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-[#e7f3eb]/50 flex items-center justify-center text-[#13ec5b] group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">egg</span>
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-sm text-[#0d1b12]">Yumurta</p>
                  <p className="text-[9px] font-extrabold text-[#a0aec0] uppercase tracking-widest mt-0.5">12 ADET • PROTEİNLER</p>
                </div>
              </div>
            </div>
          </section>

          {/* Frequent Items */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#4c9a66] px-1">Sık Kullanılanlar</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-xl border border-[#e7f3eb] hover:border-[#13ec5b] cursor-pointer transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center text-center gap-2 group">
                <span className="material-symbols-outlined text-2xl text-[#13ec5b] group-hover:scale-110 transition-transform">water_drop</span>
                <span className="font-black text-[11px] uppercase text-[#0d1b12]">Süt</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#e7f3eb] hover:border-[#13ec5b] cursor-pointer transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center text-center gap-2 group">
                <span className="material-symbols-outlined text-2xl text-[#13ec5b] group-hover:scale-110 transition-transform">nutrition</span>
                <span className="font-black text-[11px] uppercase text-[#0d1b12]">Elma</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#e7f3eb] hover:border-[#13ec5b] cursor-pointer transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center text-center gap-2 group">
                <span className="material-symbols-outlined text-2xl text-[#13ec5b] group-hover:scale-110 transition-transform">bakery_dining</span>
                <span className="font-black text-[11px] uppercase text-[#0d1b12]">Ekmek</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#e7f3eb] hover:border-[#13ec5b] cursor-pointer transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center text-center gap-2 group">
                <span className="material-symbols-outlined text-2xl text-[#13ec5b] group-hover:scale-110 transition-transform">grass</span>
                <span className="font-black text-[11px] uppercase text-[#0d1b12]">Marul</span>
              </div>
            </div>
          </section>

          {/* Tip Card */}
          <div className="bg-[#0d1b12] rounded-xl p-5 text-white relative overflow-hidden group shadow-lg">
            <h4 className="text-[#13ec5b] font-black uppercase tracking-widest text-[9px] mb-2">PROFESYONEL İPUCU</h4>
            <p className="text-[13px] font-medium leading-relaxed mb-4 relative z-10 text-white/90">Malzemelerinizi kategorize etmek, haftalık alışveriş listesi analizlerinde size %20 zaman kazandırır.</p>
            <a href="#" className="inline-block text-[10px] font-black text-white border-b-2 border-[#13ec5b] pb-0.5 hover:text-[#13ec5b] transition-colors uppercase">DAHA FAZLA ÖĞREN</a>
          </div>
        </div>
      </div>
    </div>
  );
}
