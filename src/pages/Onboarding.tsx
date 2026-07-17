import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ChevronRight, Ruler, Utensils, UtensilsCrossed } from 'lucide-react';
import { clsx } from 'clsx';
import { apiGetUser, apiSaveUser } from '../lib/api';
import { getUserId, setSessionUser } from '../lib/auth';

const activityOptions = [
  { id: 'low', title: 'Az Hareketli', desc: 'Masa başı iş, nadir egzersiz' },
  { id: 'light', title: 'Hafif Hareketli', desc: 'Haftada 1-2 gün egzersiz' },
  { id: 'medium', title: 'Orta Hareketli', desc: 'Haftada 3-4 gün spor' },
  { id: 'high', title: 'Aktif', desc: 'Hemen her gün yoğun egzersiz' },
];

const preferenceOptions = [
  ['vegan', 'Vegan'],
  ['gluten-free', 'Glutensiz'],
  ['keto', 'Ketojenik'],
  ['vegetarian', 'Vejetaryen'],
  ['lactose-free', 'Laktozsuz'],
] as const;

export default function Onboarding() {
  const navigate = useNavigate();
  const existingId = getUserId();
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('other');
  const [activityLevel, setActivityLevel] = useState('light');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!existingId) return;
    apiGetUser(existingId)
      .then(({ user }) => {
        setUsername(user.username);
        setAge(String(user.age));
        setWeight(String(user.weight));
        setHeight(String(user.height));
        setGender(user.gender);
        setActivityLevel(user.activity_level);
        setPreferences(user.preferences);
      })
      .catch((err: Error) => setError(err.message));
  }, [existingId]);

  const valid = useMemo(
    () => username.trim().length >= 3 && Number(age) >= 13 && Number(weight) >= 30 && Number(height) >= 120,
    [username, age, weight, height],
  );

  function togglePreference(value: string) {
    setPreferences((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  async function handleFinish(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!valid) {
      setError('Kullanıcı adı, yaş, kilo ve boy alanlarını geçerli değerlerle doldurun.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { user } = await apiSaveUser({
        id: existingId ?? undefined,
        username: username.trim(),
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        gender,
        activity_level: activityLevel,
        preferences,
      });
      setSessionUser({ id: user.id, username: user.username });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profil kaydedilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <header className="bg-white/90 backdrop-blur-md border-b border-border-light px-6 lg:px-20 py-4">
        <div className="max-w-[1440px] mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-text-dark">Tubi26</h1>
            <p className="text-xs text-text-muted-light">Akıllı mutfak ve beslenme asistanı</p>
          </div>
        </div>
      </header>

      <main className="flex flex-1">
        <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-background-dark">
          <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: 'linear-gradient(180deg, rgba(16,34,22,.25), rgba(16,34,22,.92)), url("https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop")' }} />
          <div className="relative z-10 flex flex-col justify-end p-16 xl:p-20">
            <span className="w-fit px-4 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold uppercase tracking-wider">{existingId ? 'Profilini Güncelle' : 'Hoş Geldin'}</span>
            <h2 className="text-5xl font-black text-white leading-tight mt-6">Mutfağındaki malzemeleri daha akıllı kullan.</h2>
            <p className="text-white/75 text-lg mt-5">Envanterini takip et, yapabileceğin tarifleri gör ve eksikleri tek listede topla.</p>
          </div>
        </div>

        <div className="w-full lg:w-7/12 bg-white overflow-y-auto">
          <form onSubmit={handleFinish} className="max-w-2xl mx-auto px-6 sm:px-10 py-12 space-y-8">
            <div>
              <h2 className="text-3xl font-extrabold text-text-dark">Kişisel Bilgiler ve Hedefler</h2>
              <p className="text-slate-500 text-sm mt-2">Kalori hedefi bu bilgilere göre yaklaşık olarak hesaplanır.</p>
            </div>

            <section className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Kullanıcı adı</label>
              <input required minLength={3} maxLength={64} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" placeholder="örn. casper" value={username} onChange={(e) => setUsername(e.target.value)} />
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2"><Ruler className="text-primary w-5 h-5" /><h3 className="text-lg font-bold">Vücut Bilgileri</h3></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[['Yaş', age, setAge, '13', '120'], ['Kilo (kg)', weight, setWeight, '30', '350'], ['Boy (cm)', height, setHeight, '120', '250']].map(([label, value, setter, min, max]) => (
                  <label key={label as string} className="space-y-1.5">
                    <span className="text-xs font-bold uppercase text-slate-500">{label as string}</span>
                    <input required type="number" min={min as string} max={max as string} step="0.1" value={value as string} onChange={(e) => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[['female', 'Kadın'], ['male', 'Erkek'], ['other', 'Belirtmek istemiyorum']].map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setGender(value as typeof gender)} className={clsx('p-3 rounded-xl border text-sm font-bold transition-colors', gender === value ? 'border-primary bg-primary/10' : 'border-slate-200 bg-white')}>{label}</button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2"><Activity className="text-primary w-5 h-5" /><h3 className="text-lg font-bold">Aktivite Seviyesi</h3></div>
              <div className="grid sm:grid-cols-2 gap-3">
                {activityOptions.map((option) => (
                  <button key={option.id} type="button" onClick={() => setActivityLevel(option.id)} className={clsx('p-4 text-left border rounded-xl transition-all', activityLevel === option.id ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50')}>
                    <p className="font-bold text-sm">{option.title}</p><p className="text-xs text-slate-500 mt-1">{option.desc}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2"><Utensils className="text-primary w-5 h-5" /><h3 className="text-lg font-bold">Beslenme Tercihleri</h3></div>
              <div className="flex flex-wrap gap-2">
                {preferenceOptions.map(([value, label]) => (
                  <button key={value} type="button" onClick={() => togglePreference(value)} className={clsx('px-4 py-2 border rounded-full text-sm font-medium transition-all', preferences.includes(value) ? 'bg-primary border-primary' : 'bg-white border-slate-200')}>{label}</button>
                ))}
              </div>
            </section>

            {error && <p role="alert" className="p-4 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold">{error}</p>}
            <button disabled={isSubmitting || !valid} className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 py-4 rounded-xl font-black text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              {isSubmitting ? 'Kaydediliyor...' : existingId ? 'Profili Güncelle' : 'Hedefimi Hesapla'} <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
