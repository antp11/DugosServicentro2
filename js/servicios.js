let imagenesGaleria = [];

function cargarServicios() {
    fetch('data/servicios.json')
        .then(response => response.json())
        .then(servicios => {
            const contenedor = document.getElementById('lista-servicios');
            contenedor.innerHTML = servicios.map(servicio => `
                <div class="col-sm-6 col-lg-4 mb-4">
                    <div class="card card-servicio-icono h-100 text-center p-4">
                        <i class="bi ${servicio.icono} servicio-icono"></i>
                        <h3 class="h5 card-title">${servicio.nombre}</h3>
                        <p class="card-text">${servicio.descripcion}</p>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            document.getElementById('lista-servicios').innerHTML =
                '<p class="text-danger text-center">No se pudieron cargar los servicios en este momento.</p>';
            console.error('Error cargando data/servicios.json:', error);
        });
}

function cargarGaleria() {
    fetch('data/galeria.json')
        .then(response => response.json())
        .then(imagenes => {
            imagenesGaleria = imagenes;
            renderizarGaleria('todos');
        })
        .catch(error => {
            document.getElementById('galeria-imagenes').innerHTML =
                '<p class="text-danger text-center">No se pudo cargar la galería en este momento.</p>';
            console.error('Error cargando data/galeria.json:', error);
        });
}

function renderizarGaleria(categoria) {
    const contenedor = document.getElementById('galeria-imagenes');
    const filtradas = categoria === 'todos'
        ? imagenesGaleria
        : imagenesGaleria.filter(imagen => imagen.categoria === categoria);

    if (filtradas.length === 0) {
        contenedor.innerHTML = '<p class="text-center">No hay imágenes en esta categoría.</p>';
        return;
    }

    contenedor.innerHTML = filtradas.map(imagen => `
        <div class="col-6 col-md-4 col-lg-3 mb-4">
            <img src="${imagen.src}" alt="${imagen.alt}" class="img-fluid rounded-4 galeria-img">
        </div>
    `).join('');
}

document.querySelectorAll('.filtro-galeria').forEach(boton => {
    boton.addEventListener('click', () => {
        document.querySelectorAll('.filtro-galeria').forEach(b => b.classList.remove('active'));
        boton.classList.add('active');
        renderizarGaleria(boton.dataset.categoria);
    });
});

cargarServicios();
cargarGaleria();
