import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ChefHat, ChevronDown, Clock, Search, ShoppingCart, Sparkles, Zap } from 'lucide-react';
import { apiGetRecipes, type Recipe } from '../lib/api';
import { getUserId } from '../lib/auth';
import { ErrorState, LoadingState } from '../components/PageState';

const categoryLabels: Record<string, string> = { breakfast: 'Kahvaltı', lunch: 'Öğle Yemeği', dinner: 'Akşam Yemeği', snack: 'Ara Öğün' };

export default function Recipes() {
  const userId = getUserId()!;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState('');
  const [onlyCookable, setOnlyCookable] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRecipes((await apiGetRecipes(userId)).recipes); }
    catch (err) { setError(err instanceof Error ? err.message : 'Tarifler yüklenemedi.'); }
    finally { setLoading(false); }
  }, [userId]);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const value = query.trim().toLocaleLowerCase('tr-TR');
    return recipes.filter((recipe) => (!onlyCookable || recipe.can_make) && (!value || `${recipe.name} ${recipe.description} ${recipe.available_ingredients.map((item) => item.name).join(' ')}`.toLocaleLowerCase('tr-TR').includes(value)));
  }, [recipes, query, onlyCookable]);

  if (loading) return <LoadingState label="Tarifler envanterinle eşleştiriliyor..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div><p className="text-sm font-bold text-primary-hover">Envanterine göre sıralandı</p><h1 className="text-4xl font-extrabold tracking-tight">Sana Özel Tarifler</h1><p className="mt-2 text-slate-500">Elindeki malzemelerle yapabileceklerini ve eksiklerini gerçek miktarlara göre gör.</p></div>
        <div className="relative w-full lg:w-96"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" /><input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none shadow-sm text-sm" placeholder="Tarif veya malzeme ara..." /></div>
      </div>

      <button onClick={() => setOnlyCookable((value) => !value)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${onlyCookable ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}><CheckCircle2 className="w-4 h-4" /> Sadece yapılabilir tarifler</button>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border-light rounded-2xl p-16 text-center"><ChefHat className="w-12 h-12 text-slate-300 mx-auto" /><h2 className="font-bold mt-4">Eşleşen tarif bulunamadı</h2><p className="text-sm text-slate-500 mt-1">Filtreyi temizleyin veya envantere yeni malzemeler ekleyin.</p><Link to="/add-ingredient" className="inline-flex mt-5 px-4 py-2 bg-primary rounded-lg font-bold text-sm">Malzeme Ekle</Link></div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((recipe, index) => {
            const expanded = selected === recipe.id;
            return (
              <article key={recipe.id} className="bg-white rounded-2xl shadow-sm border border-border-light hover:shadow-xl transition-all overflow-hidden flex flex-col">
                <div className="relative h-44 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,.55), transparent), url('${['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop','https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop','https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop'][index % 3]}')` }}>
                  <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-black shadow ${recipe.can_make ? 'bg-primary text-text-dark' : 'bg-white/90 text-rose-500'}`}>{recipe.can_make ? 'YAPILABİLİR' : `${recipe.missing_ingredients.length} EKSİK`}</span>
                  <div className="absolute bottom-4 left-5 text-white"><p className="text-xs font-bold uppercase tracking-wider">{categoryLabels[recipe.category] ?? recipe.category}</p><h2 className="text-xl font-black mt-1">{recipe.name}</h2></div>
                </div>
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <p className="text-sm text-slate-500">{recipe.description}</p>
                  <div className="flex gap-4 text-sm font-semibold"><span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary-hover" />{recipe.prep_time + recipe.cook_time} dk</span><span className="flex items-center gap-1"><Zap className="w-4 h-4 text-primary-hover" />{recipe.calories_per_serving} kcal</span><span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-hover" />{recipe.matching_count}/{recipe.ingredient_count}</span></div>
                  <div className="space-y-2">
                    {recipe.available_ingredients.length > 0 && <div className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-primary-hover" /><p><b>Sende var:</b> {recipe.available_ingredients.map((item) => item.name).join(', ')}</p></div>}
                    {recipe.missing_ingredients.length > 0 && <div className="flex items-start gap-2 text-sm"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" /><p><b className="text-rose-500">Eksik:</b> {recipe.missing_ingredients.map((item) => `${item.name} (${item.shortage} g)`).join(', ')}</p></div>}
                  </div>
                  {expanded && <div className="p-4 rounded-xl bg-background-light text-sm space-y-2"><p className="font-bold">Porsiyon başına gerekenler</p>{[...recipe.available_ingredients, ...recipe.missing_ingredients].map((item) => <div key={item.food_id} className="flex justify-between"><span>{item.name}</span><span className="font-bold">{item.required} {item.unit}</span></div>)}</div>}
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <button onClick={() => setSelected(expanded ? null : recipe.id)} className="py-2.5 border border-slate-200 rounded-xl font-bold text-sm flex items-center justify-center gap-1">{expanded ? 'Kapat' : 'Detaylar'} <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>
                    <Link to={recipe.can_make ? '/inventory' : '/shopping'} className="py-2.5 bg-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2">{recipe.can_make ? <ChefHat className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}{recipe.can_make ? 'Envanter' : 'Eksikleri Gör'}</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
