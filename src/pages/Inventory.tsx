import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarDays, PackageOpen, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { apiDeleteInventory, apiGetInventory, type InventoryItem } from '../lib/api';
import { getUserId } from '../lib/auth';
import { ErrorState, LoadingState } from '../components/PageState';

const categoryLabels: Record<string, string> = {
  protein: 'Protein', carb: 'Tahıl ve Karbonhidrat', vegetable: 'Sebze', fruit: 'Meyve', dairy: 'Süt Ürünleri', other: 'Diğer',
};

function expiryStatus(dateValue: string | null) {
  if (!dateValue) return { label: 'Tarih yok', color: 'text-slate-400 bg-slate-50' };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const expiry = new Date(`${dateValue}T00:00:00`);
  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
  if (days < 0) return { label: 'Süresi doldu', color: 'text-rose-600 bg-rose-50' };
  if (days === 0) return { label: 'Bugün bitiyor', color: 'text-rose-600 bg-rose-50' };
  if (days <= 3) return { label: `${days} gün kaldı`, color: 'text-orange-600 bg-orange-50' };
  return { label: `${days} gün kaldı`, color: 'text-primary-hover bg-primary/10' };
}

export default function Inventory() {
  const userId = getUserId()!;
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems((await apiGetInventory(userId)).items); }
    catch (err) { setError(err instanceof Error ? err.message : 'Envanter yüklenemedi.'); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR');
    return normalized ? items.filter((item) => `${item.name} ${item.category}`.toLocaleLowerCase('tr-TR').includes(normalized)) : items;
  }, [items, query]);

  async function remove(item: InventoryItem) {
    if (!window.confirm(`${item.name} envanterden silinsin mi?`)) return;
    setDeleting(item.id);
    try { await apiDeleteInventory(item.id, userId); setItems((current) => current.filter((value) => value.id !== item.id)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Ürün silinemedi.'); }
    finally { setDeleting(null); }
  }

  if (loading) return <LoadingState label="Envanter yükleniyor..." />;
  if (error && !items.length) return <ErrorState message={error} onRetry={() => void load()} />;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const expiringCount = items.filter((item) => item.expiry_date && expiryStatus(item.expiry_date).color.includes('rose')).length;
  const summaryCards: Array<{ label: string; value: string | number; icon: LucideIcon; color: string }> = [
    { label: 'Toplam ürün', value: items.length, icon: PackageOpen, color: 'bg-primary/10 text-primary-hover' },
    { label: 'Toplam miktar', value: `${Math.round(totalQuantity)} g`, icon: Sparkles, color: 'bg-blue-50 text-blue-600' },
    { label: 'Süresi dolan', value: expiringCount, icon: AlertTriangle, color: 'bg-rose-50 text-rose-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div><p className="text-sm font-bold text-primary-hover">Mutfak yönetimi</p><h1 className="text-4xl font-extrabold tracking-tight">Mutfaktakiler</h1><p className="text-slate-500 mt-2">Evdeki ürünleri, miktarlarını ve son kullanma tarihlerini takip et.</p></div>
        <Link to="/add-ingredient" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover font-bold shadow-lg shadow-primary/20"><Plus className="w-5 h-5" /> Malzeme Ekle</Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-border-light rounded-2xl p-5 flex items-center gap-4 shadow-sm"><div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div><div><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-black">{value}</p></div></div>
        ))}
      </div>

      <div className="bg-white border border-border-light rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-bold">Envanter Listesi</h2>
          <div className="relative sm:w-80"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Malzeme ara..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm" /></div>
        </div>
        {error && <p className="m-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-sm font-semibold">{error}</p>}
        {filtered.length === 0 ? (
          <div className="py-20 text-center"><PackageOpen className="w-12 h-12 text-slate-300 mx-auto" /><h3 className="font-bold mt-4">{items.length ? 'Aramana uygun ürün yok' : 'Envanterin henüz boş'}</h3><p className="text-sm text-slate-500 mt-1">{items.length ? 'Farklı bir arama yapmayı deneyin.' : 'İlk malzemenizi ekleyerek tarif eşleştirmeyi başlatın.'}</p>{!items.length && <Link to="/add-ingredient" className="inline-flex mt-5 px-4 py-2 bg-primary rounded-lg font-bold text-sm">Malzeme Ekle</Link>}</div>
        ) : (
          <div className="divide-y divide-border-light">
            {filtered.map((item) => {
              const expiry = expiryStatus(item.expiry_date);
              return (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-background-light/60 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><PackageOpen className="w-5 h-5 text-primary-hover" /></div>
                  <div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{item.name}</h3><span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold uppercase text-slate-500">{categoryLabels[item.category] ?? item.category}</span></div><p className="text-sm text-slate-500 mt-1">Yaklaşık {item.calories} kcal</p></div>
                  <div className="sm:text-right"><p className="font-black text-lg">{Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(1)} g</p><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${expiry.color}`}><CalendarDays className="w-3 h-3" />{expiry.label}</span></div>
                  <button disabled={deleting === item.id} onClick={() => void remove(item)} aria-label={`${item.name} ürününü sil`} className="p-3 rounded-xl text-rose-500 hover:bg-rose-50 disabled:opacity-50"><Trash2 className="w-5 h-5" /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
