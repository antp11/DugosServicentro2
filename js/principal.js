/* --- Video de historia: autoplay silencioso + botón de sonido --- */
const videoHistoria = document.getElementById('videoHistoria');
const btnSonidoHistoria = document.getElementById('btnSonidoHistoria');

if (videoHistoria && btnSonidoHistoria) {
    btnSonidoHistoria.addEventListener('click', () => {
        videoHistoria.muted = !videoHistoria.muted;
        btnSonidoHistoria.innerHTML = videoHistoria.muted
            ? '<i class="bi bi-volume-mute-fill"></i>'
            : '<i class="bi bi-volume-up-fill"></i>';
    });
}


/* --- Año dinámico en el footer --- */
const anioSpan = document.getElementById('anioActual');
if (anioSpan) {
    anioSpan.textContent = new Date().getFullYear();
};


/* --- Animación letra por letra del título --- */

//consejos
const tituloConsejo = document.querySelector('.reveal-consejo');
if (tituloConsejo) {
    const texto = tituloConsejo.textContent;
    tituloConsejo.textContent = '';
    [...texto].forEach((letra, i) => {
        const span = document.createElement('span');
        span.textContent = letra === ' ' ? '\u00A0' : letra;
        span.style.transitionDelay = `${i * 0.07}s`;
        tituloConsejo.appendChild(span);
    });

    const consejoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.5, rootMargin: '0px 0px -10% 0px' });
    consejoObserver.observe(tituloConsejo);
}

 
//Preguntas
const tituloFaq = document.querySelector('.reveal-titulo');
if (tituloFaq) {
    const texto = tituloFaq.textContent;
    tituloFaq.textContent = '';
    [...texto].forEach((letra, i) => {
        const span = document.createElement('span');
        span.textContent = letra === ' ' ? '\u00A0' : letra;
        span.style.transitionDelay = `${i * 0.05}s`;
        tituloFaq.appendChild(span);
    });

    const tituloObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.5, rootMargin: '0px 0px -10% 0px' });
    tituloObserver.observe(tituloFaq);
}
