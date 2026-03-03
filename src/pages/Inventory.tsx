import { Search, Plus, Droplets, EggFried, IceCream, Egg, Leaf, Carrot, Beef, Fish, Edit2, Trash2, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

const categories = [
  { id: 'all', label: 'Hepsi', active: true },
  { id: 'dairy', label: 'Süt Ürünleri', active: false },
  { id: 'veggies', label: 'Sebzeler', active: false },
  { id: 'proteins', label: 'Proteinler', active: false },
  { id: 'grains', label: 'Tahıllar', active: false },
];

const inventory = {
  dairy: {
    title: 'Süt Ürünleri',
    icon: EggFried,
    count: 4,
    items: [
      { id: 1, name: 'Süt', amount: '1.5 L', freshness: 75, icon: Droplets, color: 'text-primary', bg: 'bg-primary/20', status: 'Tazelik: %75' },
      { id: 2, name: 'Peynir', amount: '200 g', freshness: 20, icon: EggFried, color: 'text-orange-500', bg: 'bg-orange-100', status: 'Azalıyor!', isLow: true },
      { id: 3, name: 'Yoğurt', amount: '500 g', freshness: 90, icon: IceCream, color: 'text-primary', bg: 'bg-primary/20', status: 'Tazelik: %90' },
      { id: 4, name: 'Yumurta', amount: '12 Adet', freshness: 100, icon: Egg, color: 'text-primary', bg: 'bg-primary/20', status: 'Tazelik: %100' },
    ]
  },
  veggies: {
    title: 'Sebzeler',
    icon: Leaf,
    count: 3,
    items: [
      { id: 5, name: 'Domates', amount: '5 Adet', freshness: 60, icon: Leaf, color: 'text-primary', bg: 'bg-primary/20', status: 'Tazelik: %60' },
      { id: 6, name: 'Ispanak', amount: '1 Bağ', freshness: 40, icon: Leaf, color: 'text-primary', bg: 'bg-primary/20', status: 'Tazelik: %40' },
      { id: 7, name: 'Havuç', amount: '2 Adet', freshness: 10, icon: Carrot, color: 'text-red-500', bg: 'bg-red-100', status: 'Tükeniyor!', isLow: true, isCritical: true },
    ]
  },
  proteins: {
    title: 'Proteinler',
    icon: Beef,
    count: 2,
    items: [
      { id: 8, name: 'Tavuk Göğsü', amount: '500 g', freshness: 100, icon: Beef, color: 'text-primary', bg: 'bg-primary/20', status: 'Tazelik: %100' },
      { id: 9, name: 'Somon', amount: '300 g', freshness: 80, icon: Fish, color: 'text-primary', bg: 'bg-primary/20', status: 'Tazelik: %80' },
    ]
  }
};

export default function Inventory() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-text-dark">Envanterim</h2>
          <p className="text-text-muted-light mt-1 text-base">Mutfaktaki malzemelerinizi yönetin ve tarifler alın.</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/30 w-full sm:w-auto">
          <Plus className="w-5 h-5" />
          <span>Yeni Malzeme Ekle</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light w-5 h-5" />
          <input
            className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-xl ring-1 ring-border-light focus:ring-2 focus:ring-primary transition-all text-sm"
            placeholder="Malzeme ara..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={clsx(
                "px-4 py-2 text-sm font-bold rounded-full whitespace-nowrap transition-colors border",
                cat.active
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-text-muted-light border-border-light hover:border-primary"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Sections */}
      <div className="space-y-12">
        {Object.entries(inventory).map(([key, section]) => {
          const SectionIcon = section.icon;
          return (
            <section key={key}>
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-xl font-bold flex items-center gap-2 text-text-dark">
                  <SectionIcon className="text-primary w-6 h-6" />
                  {section.title}
                </h3>
                <span className="text-xs font-bold text-text-muted-light bg-border-light px-3 py-1 rounded-full">
                  {section.count} Ürün
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="bg-white p-5 rounded-2xl border border-border-light group hover:shadow-xl transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", item.bg, item.color)}>
                          <ItemIcon className="w-6 h-6" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 text-text-muted-light hover:text-primary transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-text-muted-light hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-lg mb-1 text-text-dark">{item.name}</h4>
                      <p className="text-text-muted-light text-sm mb-4">
                        Miktar: <span className="text-text-dark font-bold">{item.amount}</span>
                      </p>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            "h-full rounded-full",
                            item.isCritical ? "bg-red-500" : item.isLow ? "bg-orange-500" : "bg-primary"
                          )}
                          style={{ width: `${item.freshness}%` }}
                        ></div>
                      </div>
                      <p
                        className={clsx(
                          "text-[10px] text-right mt-1 font-bold uppercase tracking-tighter",
                          item.isCritical ? "text-red-500" : item.isLow ? "text-orange-500" : "text-text-muted-light"
                        )}
                      >
                        {item.status}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer Stats / CTA */}
      <div className="mt-16 bg-border-light rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 justify-between border border-[#cfe7d7]">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-text-dark">Harika Gözüküyor!</h4>
            <p className="text-text-muted-light text-sm max-w-sm">
              Mevcut malzemelerinizle yapılabilecek <span className="text-text-dark font-bold">12 yeni tarif</span> bulundu.
            </p>
          </div>
        </div>
        <button className="w-full md:w-auto px-8 py-4 bg-text-dark text-white font-bold rounded-2xl hover:scale-105 transition-transform">
          Tarifleri Gör
        </button>
      </div>
    </div>
  );
}
