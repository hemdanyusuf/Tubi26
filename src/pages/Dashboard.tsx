import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Sparkles, Clock, Zap, AlertCircle, ArrowRight, CheckCircle2, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';

const data = [
  { name: 'Alınan', value: 1200 },
  { name: 'Kalan', value: 800 },
];
const COLORS = ['#13ec5b', '#e7f3eb'];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-text-dark tracking-tight">Takip Paneli</h1>
          <p className="mt-2 text-text-muted-light">Bugünkü beslenme özetiniz ve akıllı öneriler.</p>
        </div>
        <Link to="/onboarding" className="text-sm font-bold text-primary hover:underline">
          Hedefleri Güncelle
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calorie Balance */}
          <div className="bg-white rounded-2xl border border-border-light p-8 shadow-sm">
            <h3 className="text-xl font-bold text-center text-text-dark mb-8">Kalori Dengesi</h3>
            <div className="relative h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-text-dark">1200</span>
                <span className="text-sm text-text-muted-light font-medium">/ 2000 kcal</span>
              </div>
            </div>
            <div className="flex justify-between mt-8 px-4 sm:px-8">
              <div className="text-center">
                <p className="text-sm text-text-muted-light font-medium">Alınan</p>
                <p className="text-xl font-bold text-text-dark">1200 kcal</p>
              </div>
              <div className="w-px bg-border-light"></div>
              <div className="text-center">
                <p className="text-sm text-text-muted-light font-medium">Kalan</p>
                <p className="text-xl font-bold text-text-dark">800 kcal</p>
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Protein */}
            <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-text-dark">Protein</h4>
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <div className="mb-4">
                <span className="text-2xl font-bold text-text-dark">80g</span>
                <span className="text-sm text-text-muted-light"> / 120g</span>
              </div>
              <div className="w-full h-2 bg-border-light rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary rounded-full" style={{ width: '66%' }}></div>
              </div>
              <p className="text-xs font-bold text-primary">+66% Hedef</p>
            </div>

            {/* Karbonhidrat */}
            <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-text-dark">Karbonhidrat</h4>
                <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">...</span>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-bold text-text-dark">150g</span>
                <span className="text-sm text-text-muted-light"> / 250g</span>
              </div>
              <div className="w-full h-2 bg-border-light rounded-full overflow-hidden mb-2">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs font-bold text-orange-500">60% Tamamlandı</p>
            </div>

            {/* Yağ */}
            <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-text-dark">Yağ</h4>
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mb-4">
                <span className="text-2xl font-bold text-text-dark">40g</span>
                <span className="text-sm text-text-muted-light"> / 65g</span>
              </div>
              <div className="w-full h-2 bg-border-light rounded-full overflow-hidden mb-2">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '61%' }}></div>
              </div>
              <p className="text-xs font-bold text-blue-500">61% Sınırda</p>
            </div>
          </div>
        </div>

        {/* Right Column - Suggestions & Inventory */}
        <div className="space-y-6">
          {/* Smart Recipe Suggestion */}
          <div className="bg-white rounded-2xl border border-border-light overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border-light flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-text-dark">Akıllı Yemek Önerisi</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative rounded-xl overflow-hidden aspect-video">
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-primary text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    Envanterle Uyumlu
                  </span>
                </div>
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop')",
                  }}
                ></div>
              </div>
              <div>
                <h4 className="font-bold text-lg text-text-dark">Izgara Tavuklu Kinoa Salatası</h4>
                <p className="text-sm text-text-muted-light mt-1">Elinizdeki malzemelerin %90'ını içerir.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-text-dark">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>20 Dakika</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-dark">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>380 kcal</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-dark">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <span>Eksik: Taze Nane</span>
                </div>
              </div>
              <button className="w-full py-3 bg-primary hover:bg-primary-hover text-text-dark font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                Tarifi Gör <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-border-light/50 p-4 m-4 mt-0 rounded-xl border border-border-light">
              <div className="flex items-start gap-2">
                <div className="bg-white p-1 rounded-full shadow-sm shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted-light uppercase tracking-wider mb-1">Diyetisyen İpucu</p>
                  <p className="text-sm text-text-dark">
                    Akşam yemeğinde karbonhidratı azaltarak protein ağırlıklı beslenmek metabolizmanı hızlandırır.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Status */}
          <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-text-dark">Envanter Durumu</h3>
              <button className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">Yönet</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted-light">Taze Sebzeler</span>
                <span className="text-sm font-bold text-red-500">Azalıyor</span>
              </div>
              <div className="w-full h-px bg-border-light"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted-light">Protein Kaynakları</span>
                <span className="text-sm font-bold text-primary">Yeterli</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="pt-8 pb-4 text-center">
        <p className="text-sm text-text-muted-light">© 2024 DiyetApp - Akıllı Beslenme ve Takip Sistemi</p>
      </footer>
    </div>
  );
}
