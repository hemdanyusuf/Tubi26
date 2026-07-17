import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Plus, ShoppingBasket, Sparkles, Trash2 } from 'lucide-react';
import { apiDeleteShopping, apiGetShopping, apiUpdateShopping, type ShoppingItem } from '../lib/api';
import { getUserId } from '../lib/auth';
import { ErrorState, LoadingState } from '../components/PageState';

const categoryLabels: Record<string, string> = { protein: 'Protein', carb: 'Tahıl ve Karbonhidrat', vegetable: 'Sebze', fruit: 'Meyve', dairy: 'Süt Ürünleri', other: 'Diğer' };

export default function Shopping() {
  const userId = getUserId()!;
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems((await apiGetShopping(userId)).items); }
    catch (err) { setError(err instanceof Error ? err.message : 'Alışveriş listesi yüklenemedi.'); }
    finally { setLoading(false); }
  }, [userId]);
  useEffect(() => { void load(); }, [load]);

  const grouped = useMemo(() => items.reduce<Record<string, ShoppingItem[]>>((groups, item) => {
    (groups[item.category] ??= []).push(item); return groups;
  }, {}), [items]);
  const completed = items.filter((item) => item.checked).length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;

  async function toggle(item: ShoppingItem) {
    setBusy(item.id); setError(null);
    try { await apiUpdateShopping(item.id, userId, !item.checked); setItems((current) => current.map((value) => value.id === item.id ? { ...value, checked: !value.checked } : value)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Öğe güncellenemedi.'); }
    finally { setBusy(null); }
  }

  async function remove(item: ShoppingItem) {
    setBusy(item.id); setError(null);
    try { await apiDeleteShopping(item.id, userId); setItems((current) => current.filter((value) => value.id !== item.id)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Öğe silinemedi.'); }
    finally { setBusy(null); }
  }

  if (loading) return <LoadingState label="Alışveriş listesi hazırlanıyor..." />;
  if (error && !items.length) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div><p className="text-sm font-bold text-primary-hover">Tarif eksikleri otomatik eklenir</p><h1 className="text-4xl font-extrabold tracking-tight">Alışveriş Listesi</h1><p className="mt-2 text-slate-500">İhtiyaçlarını tamamla, satın aldıklarını işaretle.</p></div>
        <Link to="/add-ingredient" className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover rounded-xl font-bold shadow-lg shadow-primary/20"><Plus className="w-5 h-5" /> Listeye Ekle</Link>
      </div>

      <div className="bg-background-dark text-white rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center"><ShoppingBasket className="w-6 h-6 text-primary" /></div>
        <div className="flex-1"><div className="flex justify-between text-sm mb-2"><span className="font-bold">Alışveriş ilerlemesi</span><span>{completed}/{items.length} tamamlandı</span></div><div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} /></div></div>
        <span className="text-2xl font-black text-primary">%{progress}</span>
      </div>

      {error && <p className="p-3 rounded-xl bg-rose-50 text-rose-600 text-sm font-semibold">{error}</p>}

      {items.length === 0 ? (
        <div className="bg-white border border-border-light rounded-2xl p-16 text-center"><CheckCircle2 className="w-12 h-12 text-primary mx-auto" /><h2 className="font-bold mt-4">Liste tamamlandı</h2><p className="text-sm text-slate-500 mt-1">Manuel bir ürün ekleyebilir veya yeni tarifler için envanterini güncelleyebilirsin.</p><Link to="/add-ingredient" className="inline-flex mt-5 px-4 py-2 bg-primary rounded-lg font-bold text-sm">Ürün Ekle</Link></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, categoryItems]) => (
            <section key={category} className="bg-white border border-border-light rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-background-light/70 border-b border-border-light flex justify-between"><h2 className="font-bold">{categoryLabels[category] ?? category}</h2><span className="text-xs font-bold text-slate-500">{categoryItems.length} ürün</span></div>
              <div className="divide-y divide-border-light">
                {categoryItems.map((item) => (
                  <div key={item.id} className={`p-5 flex items-center gap-4 transition-colors ${item.checked ? 'bg-slate-50/70' : ''}`}>
                    <button disabled={busy === item.id} onClick={() => void toggle(item)} aria-label={item.checked ? `${item.name} işaretini kaldır` : `${item.name} tamamlandı`} className="text-primary-hover disabled:opacity-50">{item.checked ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6 text-slate-300 hover:text-primary" />}</button>
                    <div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><p className={`font-bold ${item.checked ? 'line-through text-slate-400' : ''}`}>{item.name}</p>{item.source === 'recipe' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary-hover text-[10px] font-black"><Sparkles className="w-3 h-3" /> TARİF</span>}</div><p className="text-xs text-slate-500 mt-1">{item.reason}</p></div>
                    <p className={`font-black ${item.checked ? 'text-slate-400' : ''}`}>{Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(1)} g</p>
                    <button disabled={busy === item.id} onClick={() => void remove(item)} aria-label={`${item.name} öğesini sil`} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
