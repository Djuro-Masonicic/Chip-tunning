// Animated background particles
document.addEventListener('DOMContentLoaded', () => {
    const bgAnimation = document.querySelector('.bg-animation');
    
    if (!bgAnimation) return;
    
    // Create particles
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size
        const size = Math.random() * 100 + 50;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random animation duration
        particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
        particle.style.animationDelay = (Math.random() * 5) + 's';
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        
        bgAnimation.appendChild(particle);
    }
});
