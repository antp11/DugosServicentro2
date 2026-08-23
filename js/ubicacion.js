const DUGOS_LAT = 10.113406901987588;
const DUGOS_LNG = -84.19019112393757;

let map, directionsService, directionsRenderer;

/* --- Clima del taller: consumo de API REST externo (Open-Meteo, sin API key) --- */
const CODIGOS_CLIMA = {
    0: { texto: 'Despejado', icono: 'bi-sun-fill', categoria: 'soleado' },
    1: { texto: 'Mayormente despejado', icono: 'bi-cloud-sun-fill', categoria: 'soleado' },
    2: { texto: 'Parcialmente nublado', icono: 'bi-cloud-sun-fill', categoria: 'nublado' },
    3: { texto: 'Nublado', icono: 'bi-clouds-fill', categoria: 'nublado' },
    45: { texto: 'Neblina', icono: 'bi-cloud-fog2-fill', categoria: 'nublado' },
    48: { texto: 'Neblina', icono: 'bi-cloud-fog2-fill', categoria: 'nublado' },
    51: { texto: 'Llovizna leve', icono: 'bi-cloud-drizzle-fill', categoria: 'lluvia' },
    53: { texto: 'Llovizna', icono: 'bi-cloud-drizzle-fill', categoria: 'lluvia' },
    55: { texto: 'Llovizna intensa', icono: 'bi-cloud-drizzle-fill', categoria: 'lluvia' },
    61: { texto: 'Lluvia leve', icono: 'bi-cloud-rain-fill', categoria: 'lluvia' },
    63: { texto: 'Lluvia', icono: 'bi-cloud-rain-fill', categoria: 'lluvia' },
    65: { texto: 'Lluvia intensa', icono: 'bi-cloud-rain-heavy-fill', categoria: 'lluvia' },
    80: { texto: 'Chubascos', icono: 'bi-cloud-rain-fill', categoria: 'lluvia' },
    81: { texto: 'Chubascos', icono: 'bi-cloud-rain-fill', categoria: 'lluvia' },
    82: { texto: 'Chubascos fuertes', icono: 'bi-cloud-rain-heavy-fill', categoria: 'lluvia' },
    95: { texto: 'Tormenta eléctrica', icono: 'bi-cloud-lightning-rain-fill', categoria: 'tormenta' },
    96: { texto: 'Tormenta con granizo', icono: 'bi-cloud-lightning-rain-fill', categoria: 'tormenta' },
    99: { texto: 'Tormenta con granizo', icono: 'bi-cloud-lightning-rain-fill', categoria: 'tormenta' }
};

function cargarClima() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${DUGOS_LAT}&longitude=${DUGOS_LNG}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;

    fetch(url)
        .then(response => response.json())
        .then(datos => {
            const actual = datos.current;
            const clima = CODIGOS_CLIMA[actual.weather_code] || { texto: 'N/D', icono: 'bi-cloud-fill', categoria: 'nublado' };

            $('#climaTaller').html(`
                <div class="clima-contenido d-flex align-items-center justify-content-center gap-2 flex-wrap">
                    <i class="bi ${clima.icono} clima-icono"></i>
                    <p class="mb-0">${Math.round(actual.temperature_2m)}°C — ${clima.texto} · Humedad ${actual.relative_humidity_2m}%</p>
                </div>
            `);
        })
        .catch(error => {
            $('#climaTaller').html('<p class="mb-0 text-danger">No se pudo cargar el clima en este momento.</p>');
            console.error('Error cargando el clima (Open-Meteo):', error);
        });
}

function initMapa() {
    const dugosLocation = { lat: DUGOS_LAT, lng: DUGOS_LNG };

    map = new google.maps.Map(document.getElementById('mapa-ubicacion'), {
        zoom: 15,
        center: dugosLocation
    });

    new google.maps.Marker({
        position: dugosLocation,
        map: map,
        title: "Dugo's Servicentro"
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    $('#btnUbicacion').on('click', trazarRuta);
}

function trazarRuta() {
    if (!navigator.geolocation) {
        $('#ubicacion-estado').text('Tu navegador no soporta geolocalización.').addClass('text-danger');
        return;
    }

    $('#ubicacion-estado').text('Buscando tu ubicación...').removeClass('text-danger text-success');
    $('#btnUbicacion').prop('disabled', true);

    navigator.geolocation.getCurrentPosition(exitoUbicacion, errorUbicacion, {
        enableHighAccuracy: true,
        timeout: 10000
    });
}

function exitoUbicacion(position) {
    const origen = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };

    directionsService.route(
        {
            origin: origen,
            destination: { lat: DUGOS_LAT, lng: DUGOS_LNG },
            travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
            $('#btnUbicacion').prop('disabled', false);
            if (status === 'OK') {
                directionsRenderer.setDirections(result);
                const distancia = result.routes[0].legs[0].distance.text;
                const duracion = result.routes[0].legs[0].duration.text;
                $('#ubicacion-estado')
                    .html(`Distancia: <strong>${distancia}</strong> — Tiempo estimado: <strong>${duracion}</strong>`)
                    .addClass('text-success');
            } else {
                $('#ubicacion-estado').text('No se pudo calcular la ruta: ' + status).addClass('text-danger');
            }
        }
    );
}

function errorUbicacion(error) {
    $('#btnUbicacion').prop('disabled', false);

    let mensaje;
    switch (error.code) {
        case error.PERMISSION_DENIED:
            mensaje = 'Denegaste el permiso de ubicación. Activalo en la configuración del navegador para trazar la ruta.';
            break;
        case error.POSITION_UNAVAILABLE:
            mensaje = 'No se pudo determinar tu ubicación en este momento.';
            break;
        case error.TIMEOUT:
            mensaje = 'Se agotó el tiempo de espera buscando tu ubicación. Intentá de nuevo.';
            break;
        default:
            mensaje = 'Ocurrió un error obteniendo tu ubicación.';
    }

    $('#ubicacion-estado').text(mensaje).addClass('text-danger');
}

cargarClima();
