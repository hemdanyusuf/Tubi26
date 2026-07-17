import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Check, PackagePlus, Search, ShoppingCart } from 'lucide-react';
import { clsx } from 'clsx';
import { apiAddInventory, apiAddShopping, apiGetFoods, type Food } from '../lib/api';
import { getUserId } from '../lib/auth';
import { ErrorState, LoadingState } from '../components/PageState';

const categoryLabels: Record<string, string> = { protein: 'Protein', carb: 'Tahıl', vegetable: 'Sebze', fruit: 'Meyve', dairy: 'Süt Ürünü' };

export default function AddIngredient() {
  const navigate = useNavigate();
  const userId = getUserId()!;
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [expiryDate, setExpiryDate] = useState('');
  const [destination, setDestination] = useState<'inventory' | 'shopping'>('inventory');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGetFoods().then(({ foods: values }) => { setFoods(values); setSelectedId(values[0]?.id ?? null); }).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLocaleLowerCase('tr-TR');
    return value ? foods.filter((food) => `${food.name} ${food.category}`.toLocaleLowerCase('tr-TR').includes(value)) : foods;
  }, [foods, query]);
  const selected = foods.find((food) => food.id === selectedId) ?? null;

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(null);
    if (!selectedId || Number(quantity) <= 0) { setError('Bir ürün seçin ve geçerli miktar girin.'); return; }
    setSaving(true);
    try {
      if (destination === 'inventory') await apiAddInventory({ user_id: userId, food_id: selectedId, quantity: Number(quantity), expiry_date: expiryDate || undefined });
      else await apiAddShopping({ user_id: userId, food_id: selectedId, quantity: Number(quantity), reason: 'Manuel eklendi' });
      navigate(destination === 'inventory' ? '/inventory' : '/shopping');
    } catch (err) { setError(err instanceof Error ? err.message : 'Ürün eklenemedi.'); }
    finally { setSaving(false); }
  }

  if (loading) return <LoadingState label="Gıda kataloğu yükleniyor..." />;
  if (error && !foods.length) return <ErrorState message={error} />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div><button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-text-dark"><ArrowLeft className="w-4 h-4" /> Geri</button><h1 className="text-4xl font-extrabold tracking-tight mt-4">Malzeme Ekle</h1><p className="mt-2 text-slate-500">Katalogdan ürün seçip envanterine veya alışveriş listene ekle.</p></div>

      <form onSubmit={submit} className="grid lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3 bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border-light"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Katalogda ara..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary" /></div></div>
          <div className="max-h-[520px] overflow-y-auto custom-scrollbar divide-y divide-border-light">
            {filtered.map((food) => (
              <button key={food.id} type="button" onClick={() => setSelectedId(food.id)} className={clsx('w-full p-4 flex items-center gap-4 text-left hover:bg-background-light transition-colors', selectedId === food.id && 'bg-primary/5')}>
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', selectedId === food.id ? 'bg-primary' : 'bg-slate-100')}><PackagePlus className="w-5 h-5" /></div>
                <div className="flex-1"><p className="font-bold">{food.name}</p><p className="text-xs text-slate-500">{categoryLabels[food.category] ?? food.category} · {food.calories_per_100g} kcal / 100 g</p></div>
                {selectedId === food.id && <Check className="w-5 h-5 text-primary-hover" />}
              </button>
            ))}
            {!filtered.length && <p className="p-12 text-center text-sm text-slate-500">Aramana uygun ürün bulunamadı.</p>}
          </div>
        </section>

        <section className="lg:col-span-2 bg-white rounded-2xl border border-border-light shadow-sm p-6 h-fit space-y-6 lg:sticky lg:top-6">
          <div><p className="text-xs font-bold text-primary-hover uppercase">Seçilen ürün</p><h2 className="text-2xl font-black mt-1">{selected?.name ?? 'Ürün seçin'}</h2>{selected && <p className="text-sm text-slate-500 mt-1">Protein {selected.protein_per_100g} g · Karbonhidrat {selected.carbs_per_100g} g · Yağ {selected.fat_per_100g} g</p>}</div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setDestination('inventory')} className={clsx('p-3 rounded-xl border text-sm font-bold flex flex-col items-center gap-2', destination === 'inventory' ? 'border-primary bg-primary/10' : 'border-slate-200')}><PackagePlus className="w-5 h-5" /> Envanter</button>
            <button type="button" onClick={() => setDestination('shopping')} className={clsx('p-3 rounded-xl border text-sm font-bold flex flex-col items-center gap-2', destination === 'shopping' ? 'border-primary bg-primary/10' : 'border-slate-200')}><ShoppingCart className="w-5 h-5" /> Alışveriş</button>
          </div>
          <label className="block space-y-2"><span className="text-xs font-bold uppercase text-slate-500">Miktar (gram)</span><input required type="number" min="0.1" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-primary" /></label>
          {destination === 'inventory' && <label className="block space-y-2"><span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><CalendarDays className="w-4 h-4" /> Son kullanma tarihi</span><input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-primary" /></label>}
          {error && <p role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-600 text-sm font-semibold">{error}</p>}
          <button disabled={saving || !selected} className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl font-black shadow-lg shadow-primary/20">{saving ? 'Ekleniyor...' : destination === 'inventory' ? 'Envantere Ekle' : 'Listeye Ekle'}</button>
        </section>
      </form>
    </div>
  );
}
