# 🚗 Cipovanje Kola - Web Aplikacija za Zakazivanje

Profesionalna web aplikacija za zakazivanje chip tuning usluga.

## 🌟 Funkcionalnosti

- **Zakazivanje termina** - Klijenti mogu zakazati termin za cipovanje
- **Pregled zauzetih termina** - Automatska provera dostupnosti
- **Admin panel** - Pregled i upravljanje zakazivanjima
- **Upravljanje statusima** - Potvrđivanje, završavanje i otkazivanje termina
- **Responzivan dizajn** - Radi na svim uređajima

## 📋 Usluge

- Stage 1 Tuning
- Stage 2 Tuning  
- EGR Delete
- DPF Delete
- Custom Tuning

## 🚀 Instalacija

1. Instalirajte Node.js dependencies:
```bash
npm install
```

2. Pokrenite aplikaciju:
```bash
npm start
```

3. Otvorite browser na:
- **Početna stranica**: http://localhost:3000
- **Admin panel**: http://localhost:3000/admin

## 💻 Tehnologije

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, JavaScript
- **Storage**: JSON fajl sistem
- **Port**: 3000

## 📁 Struktura Projekta

```
CipovanjeKola/
├── public/
│   ├── index.html      # Glavna stranica za zakazivanje
│   ├── admin.html      # Admin panel
│   ├── style.css       # Stilovi
│   ├── script.js       # Frontend logika za zakazivanje
│   └── admin.js        # Frontend logika za admin
├── data/
│   └── bookings.json   # Baza zakazivanja
├── server.js           # Backend server
├── package.json
└── README.md
```

## 🔧 API Endpoints

- `GET /api/bookings` - Sva zakazivanja
- `GET /api/bookings/occupied` - Zauzeti termini
- `POST /api/bookings` - Novo zakazivanje
- `PUT /api/bookings/:id/status` - Ažuriranje statusa
- `DELETE /api/bookings/:id` - Brisanje zakazivanja

## 📝 Status Zakazivanja

- **Pending** (Na čekanju) - Novo zakazivanje
- **Confirmed** (Potvrđen) - Potvrđen termin
- **Completed** (Završen) - Završena usluga
- **Cancelled** (Otkazan) - Otkazan termin

## 🎨 Dizajn

Aplikacija koristi moderan dizajn sa:
- Gradient pozadine
- Responzivni grid layout
- Smooth animacije i transition efekti
- Intuitivni admin panel

## 📞 Korišćenje

### Za Klijente:
1. Otvorite početnu stranicu
2. Popunite formular sa podacima
3. Izaberite datum i vreme
4. Potvrdite zakazivanje

### Za Admina:
1. Otvorite admin panel
2. Pregledajte zakazivanja
3. Filtrirajte po statusu
4. Potvrđujte, završavajte ili otkazujte termine

## 🔒 Napomene

- Aplikacija koristi JSON fajl za čuvanje podataka
- Za produkciju preporučuje se korišćenje prave baze podataka
- Admin panel trenutno nije zaštićen šifrom (dodajte autentifikaciju za produkciju)

## 📄 Licenca

ISC

---

Napravljeno sa ❤️ za chip tuning entuzijaste
