

# Tubi26 — Akıllı Mutfak & Tarif Asistanı

Tubi26; **mutfak envanterini** (evde ne var?), **alışveriş listesini** ve **yapay zekâ destekli tarif önerilerini** tek yerde toplayan bir web uygulaması.

## Öne çıkanlar

- **Tarif asistanı (Gemini)**: Elindeki malzemeler ve hedef kaloriye göre tarif önerir.
- **Envanter & alışveriş**: Malzeme yönetimi ve liste akışı için ekranlar.
- **Backend API (Express)**: `/api/*` altında uçlar.
- **Veritabanı (MSSQL)**: SQL Server bağlantısı için hazır altyapı ve sağlık kontrolü.

## Teknoloji

- **Frontend**: React + TypeScript + Vite + Tailwind
- **Backend**: Node.js + Express
- **DB**: Microsoft SQL Server (`mssql`)

## Kurulum (yerel)

## Run Locally

**Önkoşullar:** Node.js (LTS önerilir)

1. Bağımlılıkları kur:

   `npm install`

2. Ortam dosyasını oluştur:

   - `.env.example` → `.env` kopyala
   - Gerekli değişkenleri doldur:
     - **Gemini**: `VITE_GEMINI_API_KEY`
     - **API**: `API_PORT` (varsayılan `3001`)
     - **MSSQL**: `MSSQL_SERVER`, `MSSQL_DATABASE` (+ gerekiyorsa `MSSQL_USER` / `MSSQL_PASSWORD`)

3. API’yi çalıştır (ayrı terminal):

   `npm run server`

4. UI’ı çalıştır:

   `npm run dev`

Uygulama: `http://localhost:3000`  
API sağlık: `GET /api/health`  
DB sağlık: `GET /api/db/health`

## Notlar

- **Gizli anahtarları commit’leme**: `.env` dosyası repoya dahil edilmez.
- Repo kökünde tasarım çıktıları `docs/` altında tutulur.

1. Install dependencies:
   `npm install`
2. Set the `VITE_GEMINI_API_KEY` in `.env` to your Gemini API key
3. Run the app:
   `npm run dev`
