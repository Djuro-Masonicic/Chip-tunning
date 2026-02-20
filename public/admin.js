const API_URL = 'http://localhost:8086/api';
let allBookings = [];
let currentFilter = 'all';

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');
const mobileOverlay = document.getElementById('mobileOverlay');

if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        sidebar.classList.toggle('active');
        if (mobileOverlay) {
            mobileOverlay.classList.toggle('active');
        }
    });
    
    // Close menu when clicking outside (overlay)
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
        });
    }
    
    // Close menu when clicking outside (document)
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenuBtn.classList.remove('active');
            sidebar.classList.remove('active');
            if (mobileOverlay) {
                mobileOverlay.classList.remove('active');
            }
        }
    });
    
    // Close menu when clicking a link
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            sidebar.classList.remove('active');
            if (mobileOverlay) {
                mobileOverlay.classList.remove('active');
            }
        });
    });
}

// Update statistics
function updateStats() {
    const total = allBookings.length;
    const pending = allBookings.filter(b => b.status === 'pending').length;
    const confirmed = allBookings.filter(b => b.status === 'confirmed').length;
    const completed = allBookings.filter(b => b.status === 'completed').length;
    
    document.getElementById('totalCount').textContent = total;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('confirmedCount').textContent = confirmed;
    document.getElementById('completedCount').textContent = completed;
}

// Notification funkcija
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Učitaj sva zakazivanja
async function loadBookings() {
    const bookingsList = document.getElementById('bookingsList');
    bookingsList.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p class="loading">Učitavanje podataka...</p></div>';
    
    try {
        const response = await fetch(`${API_URL}/bookings`);
        allBookings = await response.json();
        
        updateStats();
        displayBookings();
    } catch (error) {
        console.error('Greška:', error);
        bookingsList.innerHTML = '<p class="no-bookings">Greška pri učitavanju zakazivanja</p>';
    }
}

// Prikaži zakazivanja
function displayBookings() {
    const bookingsList = document.getElementById('bookingsList');
    
    let filteredBookings = allBookings;
    
    // Primeni filter
    if (currentFilter !== 'all') {
        filteredBookings = allBookings.filter(b => b.status === currentFilter);
    }
    
    // Sortiraj po datumu
    filteredBookings.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA - dateB;
    });
    
    if (filteredBookings.length === 0) {
        bookingsList.innerHTML = '<p class="no-bookings">Nema zakazanih termina</p>';
        return;
    }
    
    bookingsList.innerHTML = filteredBookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <div class="booking-title">
                    ${booking.carBrand} ${booking.carModel} ${booking.carYear ? `(${booking.carYear})` : ''}
                </div>
                <span class="status-badge ${booking.status}">${getStatusText(booking.status)}</span>
            </div>
            
            <div class="booking-details">
                <div class="detail-item">
                    <span class="detail-label">Klijent</span>
                    <span class="detail-value">${booking.name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Telefon</span>
                    <span class="detail-value">${booking.phone}</span>
                </div>
                ${booking.email ? `
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${booking.email}</span>
                </div>
                ` : ''}
                <div class="detail-item">
                    <span class="detail-label">Usluga</span>
                    <span class="detail-value">${getServiceName(booking.service)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Datum</span>
                    <span class="detail-value">${formatDate(booking.date)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Vreme</span>
                    <span class="detail-value">${booking.time}</span>
                </div>
            </div>
            
            ${booking.notes ? `
                <div class="detail-item" style="margin-bottom: 15px;">
                    <span class="detail-label">Napomena</span>
                    <span class="detail-value">${booking.notes}</span>
                </div>
            ` : ''}
            
            <div class="booking-actions">
                ${booking.status === 'pending' ? `
                    <button class="btn-action btn-confirm" onclick="updateStatus('${booking.id}', 'confirmed')">
                        ✓ Potvrdi
                    </button>
                ` : ''}
                ${booking.status === 'confirmed' ? `
                    <button class="btn-action btn-complete" onclick="updateStatus('${booking.id}', 'completed')">
                        ✓ Završi
                    </button>
                ` : ''}
                ${booking.status !== 'cancelled' && booking.status !== 'completed' ? `
                    <button class="btn-action btn-cancel" onclick="updateStatus('${booking.id}', 'cancelled')">
                        ✗ Otkaži
                    </button>
                ` : ''}
                <button class="btn-action btn-delete" onclick="deleteBooking('${booking.id}')">
                    🗑️ Obriši
                </button>
            </div>
        </div>
    `).join('');
}

// Ažuriraj status
async function updateStatus(id, status) {
    try {
        const response = await fetch(`${API_URL}/bookings/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showNotification('✅ Status uspešno ažuriran', 'success');
            await loadBookings();
        } else {
            const data = await response.json();
            showNotification('❌ ' + (data.error || 'Greška pri ažuriranju statusa'), 'error');
        }
    } catch (error) {
        console.error('Greška:', error);
        showNotification('❌ Greška pri povezivanju sa serverom', 'error');
    }
}

// Obriši zakazivanje
async function deleteBooking(id) {
    if (!confirm('⚠️ Da li ste sigurni da želite da obrišete ovo zakazivanje?\\n\\nOva akcija se ne može poništiti!')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/bookings/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('✅ Zakazivanje uspešno obrisano', 'success');
            await loadBookings();
        } else {
            const data = await response.json();
            showNotification('❌ ' + (data.error || 'Greška pri brisanju'), 'error');
        }
    } catch (error) {
        console.error('Greška:', error);
        showNotification('❌ Greška pri povezivanju sa serverom', 'error');
    }
}

// Filter funkcija
function filterBookings(filter) {
    currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    displayBookings();
}

// Helper funkcije
function getStatusText(status) {
    const statuses = {
        'pending': 'Na čekanju',
        'confirmed': 'Potvrđen',
        'completed': 'Završen',
        'cancelled': 'Otkazan'
    };
    return statuses[status] || status;
}

function getServiceName(service) {
    const services = {
        'stage1': 'Stage 1 Tuning',
        'stage2': 'Stage 2 Tuning',
        'egr': 'EGR Delete',
        'dpf': 'DPF Delete',
        'stage1-egr': 'Stage 1 + EGR',
        'stage1-dpf': 'Stage 1 + DPF',
        'custom': 'Custom tuning'
    };
    return services[service] || service;
}

// Progress Bar and Back to Top
window.addEventListener('scroll', () => {
    const progressBar = document.getElementById('progressBar');
    const backToTop = document.getElementById('backToTop');
    
    if (progressBar) {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    }
    
    if (backToTop) {
        if ((document.body.scrollTop || document.documentElement.scrollTop) > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    }
});

// Back to Top Click
document.getElementById('backToTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Učitaj zakazivanja pri pokretanju
document.addEventListener('DOMContentLoaded', () => {
    loadBookings();
});
