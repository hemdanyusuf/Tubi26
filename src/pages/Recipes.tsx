import { Search, Clock, Zap, Utensils, ChevronDown, CheckCircle2, AlertCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

const recipes = [
  {
    id: 1,
    title: 'Avokadolu Çılbır ve Ekmek',
    category: 'KAHVALTI',
    time: '15 DK',
    calories: '450 kcal',
    image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=800&auto=format&fit=crop',
    hasIngredients: ['Yumurta', 'Avokado', 'Yoğurt'],
    missingIngredients: ['Tam Buğday Ekmeği'],
    aspectRatio: 'aspect-[4/5]',
  },
  {
    id: 2,
    title: 'Renkli Sebzeli Tavuk Sote',
    category: 'AKŞAM YEMEĞİ',
    time: '25 DK',
    calories: '320 kcal',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop',
    hasIngredients: ['Tavuk Göğsü', 'Biber', 'Zeytinyağı'],
    missingIngredients: ['Kuru Soğan', 'Soya Sosu'],
    aspectRatio: 'aspect-[3/4]',
  },
  {
    id: 3,
    title: 'Nar Ekşili Kinoa Salatası',
    category: 'ÖĞLE YEMEĞİ',
    time: '20 DK',
    calories: '280 kcal',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    hasIngredients: ['Kinoa', 'Domates', 'Nar Ekşisi'],
    missingIngredients: ['Maydanoz', 'Ceviz'],
    aspectRatio: 'aspect-[1/1]',
  },
  {
    id: 4,
    title: 'Izgara Somon ve Kuşkonmaz',
    category: 'AKŞAM YEMEĞİ',
    time: '30 DK',
    calories: '510 kcal',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800&auto=format&fit=crop',
    hasIngredients: ['Somon', 'Tuz', 'Karabiber'],
    missingIngredients: ['Kuşkonmaz', 'Limon'],
    aspectRatio: 'aspect-[4/3]',
  },
  {
    id: 5,
    title: 'Yöresel Mercimek Köftesi',
    category: 'ARA ÖĞÜN',
    time: '45 DK',
    calories: '190 kcal',
    image: 'https://images.unsplash.com/photo-1625937759429-27d268846395?q=80&w=800&auto=format&fit=crop',
    hasIngredients: ['Kırmızı Mercimek', 'Bulgur', 'Salça'],
    missingIngredients: ['Taze Soğan', 'Maydanoz'],
    aspectRatio: 'aspect-[3/4]',
  },
  {
    id: 6,
    title: 'Fırında Hafif Mücver',
    category: 'ÖĞLE YEMEĞİ',
    time: '35 DK',
    calories: '240 kcal',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop',
    hasIngredients: ['Kabak', 'Yumurta', 'Dereotu'],
    missingIngredients: ['Beyaz Peynir'],
    aspectRatio: 'aspect-[1/1]',
  },
];

export default function Recipes() {
  return (
    <div className="space-y-10">
      {/* Hero Search Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-text-dark tracking-tight">Sana Özel Tarifler</h1>
            <p className="mt-2 text-slate-500">Envanterindeki malzemeleri kullanarak neler pişirebileceğine göz at.</p>
          </div>
          <div className="w-full md:max-w-md">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm text-sm"
                placeholder="Elinizdeki malzemelerle ne pişirmek istersiniz?"
                type="text"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:border-primary transition-all shadow-sm">
            <Clock className="w-4 h-4" />
            Pişirme Süresi
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:border-primary transition-all shadow-sm">
            <Zap className="w-4 h-4" />
            Kalori Aralığı
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:border-primary transition-all shadow-sm">
            <Utensils className="w-4 h-4" />
            Mutfak Tipi
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary-hover rounded-lg text-sm font-bold hover:bg-primary/20 transition-all">
            Tümünü Temizle
          </button>
        </div>
      </div>

      {/* Recipe Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="break-inside-avoid group bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div className={clsx("relative overflow-hidden", recipe.aspectRatio)}>
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  {recipe.calories}
                </span>
              </div>
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url('${recipe.image}')` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-text-dark leading-tight">{recipe.title}</h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                  {recipe.category} • {recipe.time}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="text-primary w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-slate-700">
                    <span className="text-primary-hover">Sende var:</span> {recipe.hasIngredients.join(', ')}
                  </p>
                </div>
                {recipe.missingIngredients.length > 0 && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-rose-500 w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-sm font-medium text-slate-700">
                      <span className="text-rose-500">Eksik:</span> {recipe.missingIngredients.join(', ')}
                    </p>
                  </div>
                )}
              </div>
              <button className="w-full py-2.5 bg-primary hover:bg-primary-hover text-text-dark font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                Tarifi Gör <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-16 flex items-center justify-center gap-2">
        <button className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 hover:bg-slate-100 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 rounded-full bg-primary text-text-dark font-bold shadow-md">1</button>
        <button className="w-10 h-10 rounded-full hover:bg-slate-100 font-medium transition-all">2</button>
        <button className="w-10 h-10 rounded-full hover:bg-slate-100 font-medium transition-all">3</button>
        <button className="w-10 h-10 rounded-full hover:bg-slate-100 font-medium transition-all">4</button>
        <button className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 hover:bg-slate-100 transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
