import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Activity, AlertCircle, ArrowRight, Clock, Flame, Plus, Refrigerator, Sparkles, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { apiAddActivity, apiAddMeal, apiGetDashboard, type DashboardData } from '../lib/api';
import { getUserId } from '../lib/auth';
import { ErrorState, LoadingState } from '../components/PageState';

export default function Dashboard() {
  const userId = getUserId()!;
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [activityName, setActivityName] = useState('');
  const [burnedCalories, setBurnedCalories] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setError(null);
    return apiGetDashboard(userId).then(setData).catch((err: Error) => setError(err.message));
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const chartData = useMemo(() => data ? [
    { name: 'Alınan', value: data.calories.consumed },
    { name: 'Kalan', value: data.calories.remaining || (data.calories.consumed ? 0 : data.calories.target) },
  ] : [], [data]);

  async function addMeal(event: React.FormEvent) {
    event.preventDefault();
    if (!mealName.trim() || Number(mealCalories) <= 0) return;
    setSaving(true);
    try {
      await apiAddMeal({ user_id: userId, name: mealName.trim(), calories: Number(mealCalories), meal_type: 'meal' });
      setMealName(''); setMealCalories(''); await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Öğün kaydedilemedi.'); }
    finally { setSaving(false); }
  }

  async function addActivity(event: React.FormEvent) {
    event.preventDefault();
    if (!activityName.trim() || Number(burnedCalories) <= 0) return;
    setSaving(true);
    try {
      await apiAddActivity({ user_id: userId, name: activityName.trim(), burned_calories: Number(burnedCalories) });
      setActivityName(''); setBurnedCalories(''); await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Aktivite kaydedilemedi.'); }
    finally { setSaving(false); }
  }

  if (error && !data) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!data) return <LoadingState label="Dashboard hazırlanıyor..." />;

  const recipe = data.recommended_recipe;
  const categoryEntries = Object.entries(data.inventory.categories);
  const calorieStats: Array<{ label: string; value: number; icon: LucideIcon }> = [
    { label: 'Alınan', value: data.calories.consumed, icon: Flame },
    { label: 'Yakılan', value: data.calories.burned, icon: Activity },
    { label: 'Kalan', value: data.calories.remaining, icon: Zap },
    { label: 'Hedef', value: data.calories.target, icon: Sparkles },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <p className="text-sm font-bold text-primary-hover">Merhaba, {data.profile.username}</p>
          <h1 className="text-4xl font-extrabold text-text-dark tracking-tight mt-1">Takip Paneli</h1>
          <p className="mt-2 text-text-muted-light">Bugünkü beslenme özetiniz ve mutfak durumunuz.</p>
        </div>
        <Link to="/onboarding" className="text-sm font-bold text-primary-hover hover:underline">Hedefleri Güncelle</Link>
      </div>

      {error && <p className="p-3 rounded-xl bg-rose-50 text-rose-600 text-sm font-semibold">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-border-light p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Kalori Dengesi</h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary-hover">Günlük hedef</span>
            </div>
            <div className="grid sm:grid-cols-2 items-center">
              <div className="relative h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={chartData} innerRadius={68} outerRadius={88} startAngle={90} endAngle={-270} dataKey="value" stroke="none">{chartData.map((entry, index) => <Cell key={entry.name} fill={['#13ec5b', '#e7f3eb'][index]} />)}</Pie></PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-black">{data.calories.consumed}</span><span className="text-xs text-slate-500">/ {data.calories.target} kcal</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {calorieStats.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="p-4 rounded-xl bg-background-light"><Icon className="w-4 h-4 text-primary-hover mb-2" /><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-black">{value} <span className="text-xs font-medium">kcal</span></p></div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <form onSubmit={addMeal} className="bg-white rounded-2xl border border-border-light p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /><h3 className="font-bold">Öğün Kaydet</h3></div>
              <input value={mealName} onChange={(e) => setMealName(e.target.value)} placeholder="Örn. Sebzeli omlet" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-primary" />
              <div className="flex gap-2"><input value={mealCalories} onChange={(e) => setMealCalories(e.target.value)} type="number" min="1" placeholder="Kalori" className="min-w-0 flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-primary" /><button disabled={saving} className="px-4 rounded-xl bg-primary font-bold"><Plus className="w-5 h-5" /></button></div>
            </form>
            <form onSubmit={addActivity} className="bg-white rounded-2xl border border-border-light p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" /><h3 className="font-bold">Aktivite Kaydet</h3></div>
              <input value={activityName} onChange={(e) => setActivityName(e.target.value)} placeholder="Örn. 30 dakika yürüyüş" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-primary" />
              <div className="flex gap-2"><input value={burnedCalories} onChange={(e) => setBurnedCalories(e.target.value)} type="number" min="1" placeholder="Yakılan kalori" className="min-w-0 flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-primary" /><button disabled={saving} className="px-4 rounded-xl bg-primary font-bold"><Plus className="w-5 h-5" /></button></div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border-light overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border-light flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary-hover" /><h3 className="font-bold">En Uygun Tarif</h3></div>
            {recipe ? (
              <div className="p-6 space-y-4">
                <div className="rounded-xl overflow-hidden aspect-video bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop')" }} />
                <div><div className="flex justify-between gap-3"><h4 className="font-bold text-lg">{recipe.name}</h4>{recipe.can_make && <span className="h-fit text-[10px] font-bold bg-primary/15 text-primary-hover rounded-full px-2 py-1">YAPILABİLİR</span>}</div><p className="text-sm text-slate-500 mt-1">{recipe.description}</p></div>
                <div className="grid grid-cols-2 gap-2 text-sm"><span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary-hover" />{recipe.prep_time + recipe.cook_time} dk</span><span className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary-hover" />{recipe.calories_per_serving} kcal</span></div>
                {recipe.missing_ingredients.length > 0 && <p className="flex gap-2 text-sm text-rose-500"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{recipe.missing_ingredients.map((item) => item.name).join(', ')} eksik</p>}
                <Link to="/recipes" className="w-full py-3 bg-primary hover:bg-primary-hover font-bold rounded-xl flex items-center justify-center gap-2">Tariflere Git <ArrowRight className="w-5 h-5" /></Link>
              </div>
            ) : <p className="p-6 text-sm text-slate-500">Henüz tarif bulunmuyor.</p>}
          </div>

          <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5"><div className="flex items-center gap-2"><Refrigerator className="w-5 h-5 text-primary-hover" /><h3 className="font-bold">Envanter</h3></div><Link to="/inventory" className="text-xs font-bold text-primary-hover">Yönet</Link></div>
            <div className="grid grid-cols-2 gap-3 mb-4"><div className="p-3 rounded-xl bg-background-light"><p className="text-2xl font-black">{data.inventory.item_count}</p><p className="text-xs text-slate-500">ürün</p></div><div className="p-3 rounded-xl bg-rose-50"><p className="text-2xl font-black text-rose-500">{data.inventory.expiring_count}</p><p className="text-xs text-rose-500">yakında bitiyor</p></div></div>
            <div className="space-y-2">{categoryEntries.length ? categoryEntries.map(([category, count]) => <div key={category} className="flex justify-between text-sm"><span className="capitalize text-slate-500">{category}</span><span className="font-bold">{count}</span></div>) : <p className="text-sm text-slate-500">Envanteriniz boş.</p>}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
