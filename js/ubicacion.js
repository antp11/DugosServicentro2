const DUGOS_LAT = 10.113406901987588;
const DUGOS_LNG = -84.19019112393757;

let map, directionsService, directionsRenderer;

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
