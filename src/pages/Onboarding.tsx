import { Link } from 'react-router-dom';
import { UtensilsCrossed, Ruler, Activity, Utensils, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-light px-4 sm:px-6 lg:px-20 py-3">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 text-text-dark">
            <div className="w-6 h-6 shrink-0">
              <UtensilsCrossed className="w-full h-full text-primary" />
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight hidden sm:block">Diyetisyen App</h2>
          </Link>
          <div className="flex flex-1 justify-end gap-4 sm:gap-8 items-center">
            <nav className="hidden md:flex items-center gap-9">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Ana Sayfa</Link>
              <Link to="/recipes" className="text-sm font-medium hover:text-primary transition-colors">Tarifler</Link>
              <Link to="/dietitians" className="text-sm font-medium hover:text-primary transition-colors">Diyetisyenler</Link>
              <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">Hakkımızda</Link>
            </nav>
            <button className="bg-primary hover:bg-primary-hover text-text-dark px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm">
              Giriş Yap
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Left Side: Hero Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-background-dark">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{
              backgroundImage: 'linear-gradient(180deg, rgba(16, 34, 22, 0.4) 0%, rgba(16, 34, 22, 0.9) 100%), url("https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop")',
            }}
          ></div>
          <div className="relative z-10 flex flex-col justify-end p-20 w-full">
            <div className="space-y-6">
              <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Hoş Geldiniz
              </span>
              <h1 className="text-5xl font-black text-white leading-tight">Sağlıklı Yaşama İlk Adımınızı Atın</h1>
              <p className="text-white/80 text-lg max-w-md">
                Kişisel verilerinizle size özel beslenme programınızı ve en lezzetli tarifleri keşfedin.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex -space-x-3">
                  <img className="w-10 h-10 rounded-full border-2 border-background-dark" src="https://i.pravatar.cc/150?img=11" alt="User" />
                  <img className="w-10 h-10 rounded-full border-2 border-background-dark" src="https://i.pravatar.cc/150?img=32" alt="User" />
                  <img className="w-10 h-10 rounded-full border-2 border-background-dark" src="https://i.pravatar.cc/150?img=44" alt="User" />
                </div>
                <p className="text-white/60 text-sm self-center">10,000+ kullanıcıya katıldınız</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="w-full lg:w-1/2 bg-white overflow-y-auto custom-scrollbar">
          <div className="max-w-xl mx-auto px-8 py-12">
            {/* Progress Header */}
            <div className="mb-10">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-text-dark">Kişisel Bilgiler ve Hedefler</h2>
                  <p className="text-slate-500 text-sm mt-1">Size en uygun planı hazırlamamız için formu doldurun.</p>
                </div>
                <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">Adım 1/3</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[33%] rounded-full transition-all duration-500"></div>
              </div>
            </div>

            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              {/* Vücut Bilgileri */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="text-primary w-5 h-5" />
                  <h3 className="text-lg font-bold text-text-dark">Vücut Bilgileri</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Yaş</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="25"
                      type="number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Kilo (kg)</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="70"
                      type="number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Boy (cm)</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="175"
                      type="number"
                    />
                  </div>
                </div>
              </section>

              {/* Aktivite Seviyesi */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="text-primary w-5 h-5" />
                  <h3 className="text-lg font-bold text-text-dark">Aktivite Seviyesi</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'low', title: 'Az Hareketli', desc: 'Masa başı iş, nadir egzersiz', defaultChecked: true },
                    { id: 'medium', title: 'Orta Hareketli', desc: 'Haftada 3-4 gün spor' },
                    { id: 'high', title: 'Aktif', desc: 'Her gün yoğun egzersiz' },
                    { id: 'pro', title: 'Sporcu / Profesyonel', desc: 'Günde birden fazla antrenman' },
                  ].map((level) => (
                    <label key={level.id} className="cursor-pointer group">
                      <input className="peer hidden" name="activity" type="radio" defaultChecked={level.defaultChecked} />
                      <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                        <p className="font-bold text-sm text-text-dark">{level.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{level.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* Beslenme Tercihleri */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="text-primary w-5 h-5" />
                  <h3 className="text-lg font-bold text-text-dark">Beslenme Tercihleri</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'vegan', label: 'Vegan' },
                    { id: 'gluten-free', label: 'Glutensiz' },
                    { id: 'keto', label: 'Ketojenik' },
                    { id: 'vegetarian', label: 'Vejetaryen', defaultChecked: true },
                    { id: 'lactose-free', label: 'Laktozsuz' },
                  ].map((pref) => (
                    <label key={pref.id} className="cursor-pointer">
                      <input className="peer hidden" type="checkbox" defaultChecked={pref.defaultChecked} />
                      <div className="px-4 py-2 border border-slate-200 rounded-full text-sm font-medium bg-white peer-checked:bg-primary peer-checked:border-primary peer-checked:text-text-dark transition-all">
                        {pref.label}
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* Footer Action */}
              <div className="pt-6 border-t border-slate-100">
                <Link
                  to="/dashboard"
                  className="w-full bg-primary hover:bg-primary-hover text-text-dark py-4 rounded-xl font-black text-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <span>Hedefimi Hesapla</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <p className="text-center text-xs text-slate-400 mt-4">
                  Devam ederek kullanım koşullarını kabul etmiş sayılırsınız.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
