const API_URL = 'http://localhost:3000/api';

// Progress Bar
window.addEventListener('scroll', () => {
    const progressBar = document.getElementById('progressBar');
    const backToTop = document.getElementById('backToTop');
    
    if (progressBar) {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    }
    
    // Back to top button
    if (backToTop) {
        if (winScroll > 300) {
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

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Notification funkcija
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Postavi minimalni datum na danas
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Učitaj zauzete termine
    loadOccupiedSlots();
});

// Učitaj zauzete termine
async function loadOccupiedSlots() {
    try {
        const response = await fetch(`${API_URL}/bookings/occupied`);
        const occupied = await response.json();
        
        // Sačuvaj zauzete termine
        window.occupiedSlots = occupied;
        
    } catch (error) {
        console.error('Greška pri učitavanju zauzetih termina:', error);
    }
}

// Proveri da li je termin dostupan
function isSlotAvailable(date, time) {
    if (!window.occupiedSlots) return true;
    
    return !window.occupiedSlots.some(slot => 
        slot.date === date && slot.time === time
    );
}

// Ažuriraj dostupna vremena kada se promeni datum
document.getElementById('date')?.addEventListener('change', function() {
    const selectedDate = this.value;
    const timeSelect = document.getElementById('time');
    const timeHint = document.getElementById('timeHint');
    
    if (!selectedDate || !window.occupiedSlots) return;
    
    let availableCount = 0;
    let occupiedCount = 0;
    
    // Resetuj sve opcije
    Array.from(timeSelect.options).forEach((option, index) => {
        if (index === 0) return; // Preskoči prvu opciju (placeholder)
        
        const time = option.value;
        const isAvailable = isSlotAvailable(selectedDate, time);
        
        if (isAvailable) {
            availableCount++;
            option.disabled = false;
            option.textContent = option.textContent.replace(' (Zauzeto)', '').replace(' ✅', '') + ' ✅';
        } else {
            occupiedCount++;
            option.disabled = true;
            option.textContent = option.textContent.replace(' ✅', '').replace(' (Zauzeto)', '') + ' (Zauzeto)';
        }
    });
    
    // Ažuriraj hint
    if (availableCount === 0) {
        timeHint.textContent = '⚠️ Nema slobodnih termina za ovaj datum';
        timeHint.style.color = '#ff3838';
    } else {
        timeHint.textContent = `✅ ${availableCount} slobodnih termina dostupno`;
        timeHint.style.color = '#00d9ff';
    }
});

// Форма za zakazivanje
document.getElementById('bookingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Disable button and show loading
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        carBrand: document.getElementById('carBrand').value.trim(),
        carModel: document.getElementById('carModel').value.trim(),
        carYear: document.getElementById('carYear').value,
        service: document.getElementById('service').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        notes: document.getElementById('notes').value.trim()
    };
    
    // Proveri da li je termin dostupan
    if (!isSlotAvailable(formData.date, formData.time)) {
        showNotification('❌ Ovaj termin je već zauzet! Molimo izaberite drugi termin.', 'error');
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('✅ Termin uspešno zakazan! Kontaktiraćemo Vas uskoro na broj telefona koji ste ostavili.', 'success');
            document.getElementById('bookingForm').reset();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Osveži zauzete termine
            await loadOccupiedSlots();
        } else {
            showNotification('❌ ' + (data.error || 'Greška pri zakazivanju termina'), 'error');
        }
    } catch (error) {
        console.error('Greška:', error);
        showNotification('❌ Greška pri povezivanju sa serverom. Proverite internet konekciju.', 'error');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
});
