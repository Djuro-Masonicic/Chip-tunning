const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Fajl za čuvanje zakazivanja
const DATA_FILE = './data/bookings.json';

// Inicijalizacija data foldera i fajla
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Funkcije za rad sa podacima
function getBookings() {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

function saveBookings(bookings) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2));
}

// API Routes

// GET - Sva zakazivanja
app.get('/api/bookings', (req, res) => {
    try {
        const bookings = getBookings();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Greška pri učitavanju zakazivanja' });
    }
});

// GET - Zauzeti termini
app.get('/api/bookings/occupied', (req, res) => {
    try {
        const bookings = getBookings();
        const occupied = bookings.map(b => ({
            date: b.date,
            time: b.time
        }));
        res.json(occupied);
    } catch (error) {
        res.status(500).json({ error: 'Greška pri učitavanju termina' });
    }
});

// POST - Novo zakazivanje
app.post('/api/bookings', (req, res) => {
    try {
        const { name, phone, email, carBrand, carModel, carYear, service, date, time, notes } = req.body;

        // Validacija
        if (!name || !phone || !carBrand || !carModel || !date || !time || !service) {
            return res.status(400).json({ error: 'Molimo popunite sva obavezna polja' });
        }

        const bookings = getBookings();

        // Provera da li je termin zauzet
        const isOccupied = bookings.some(b => b.date === date && b.time === time);
        if (isOccupied) {
            return res.status(409).json({ error: 'Ovaj termin je već zauzet' });
        }

        // Kreiranje novog zakazivanja
        const newBooking = {
            id: Date.now().toString(),
            name,
            phone,
            email: email || '',
            carBrand,
            carModel,
            carYear: carYear || '',
            service,
            date,
            time,
            notes: notes || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        bookings.push(newBooking);
        saveBookings(bookings);

        res.status(201).json({ 
            message: 'Zakazivanje uspešno kreirano!', 
            booking: newBooking 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Greška pri kreiranju zakazivanja' });
    }
});

// DELETE - Brisanje zakazivanja
app.delete('/api/bookings/:id', (req, res) => {
    try {
        const { id } = req.params;
        let bookings = getBookings();
        
        const initialLength = bookings.length;
        bookings = bookings.filter(b => b.id !== id);
        
        if (bookings.length === initialLength) {
            return res.status(404).json({ error: 'Zakazivanje nije pronađeno' });
        }
        
        saveBookings(bookings);
        res.json({ message: 'Zakazivanje uspešno obrisano' });
    } catch (error) {
        res.status(500).json({ error: 'Greška pri brisanju zakazivanja' });
    }
});

// PUT - Ažuriranje statusa
app.put('/api/bookings/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const bookings = getBookings();
        const booking = bookings.find(b => b.id === id);
        
        if (!booking) {
            return res.status(404).json({ error: 'Zakazivanje nije pronađeno' });
        }
        
        booking.status = status;
        saveBookings(bookings);
        
        res.json({ message: 'Status ažuriran', booking });
    } catch (error) {
        res.status(500).json({ error: 'Greška pri ažuriranju statusa' });
    }
});

// Serviranje HTML stranica
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Pokretanje servera
app.listen(PORT, () => {
    console.log(`🚗 Server pokrenut na http://localhost:${PORT}`);
    console.log(`📅 Aplikacija za zakazivanje cipovanja je spremna!`);
});
