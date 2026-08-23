const { createApp, reactive, computed, ref } = Vue;

createApp({
    setup() {
        const form = reactive({
            nombre: '',
            email: '',
            telefono: '',
            fechaNacimiento: '',
            rangoIngreso: '',
            genero: '',
            gradoAcademico: [],
            mensaje: ''
        });

        const opcionesGenero = ['Masculino', 'Femenino', 'Otro'];
        const opcionesGrado = ['Primaria', 'Bachillerato', 'Técnico', 'Universitario'];

        const edad = computed(() => {
            if (!form.fechaNacimiento) return '';
            const nacimiento = new Date(form.fechaNacimiento);
            const hoy = new Date();
            let años = hoy.getFullYear() - nacimiento.getFullYear();
            const mes = hoy.getMonth() - nacimiento.getMonth();
            if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
                años--;
            }
            return años >= 0 ? años : '';
        });

        const enviando = ref(false);
        const mensajeEstado = ref('');
        const claseEstado = ref('');

        if (window.emailjs) {
            emailjs.init({ publicKey: '4dYmtdy3Canxr3l0D' });
        }

        function enviarFormulario() {
            if (form.gradoAcademico.length === 0) {
                mensajeEstado.value = 'Seleccioná al menos un grado académico.';
                claseEstado.value = 'text-danger';
                return;
            }

            enviando.value = true;
            mensajeEstado.value = 'Enviando...';
            claseEstado.value = '';

            const parametros = {
                nombre: form.nombre,
                email: form.email,
                telefono: form.telefono,
                fechaNacimiento: form.fechaNacimiento,
                edad: edad.value,
                rangoIngreso: form.rangoIngreso,
                genero: form.genero,
                gradoAcademico: form.gradoAcademico.join(', '),
                mensaje: form.mensaje
            };

            emailjs.send('service_3y6fckp', 'template_mh6j688', parametros)
                .then(() => {
                    mensajeEstado.value = '¡Mensaje enviado! Te contactaremos pronto.';
                    claseEstado.value = 'text-success';
                    form.nombre = '';
                    form.email = '';
                    form.telefono = '';
                    form.fechaNacimiento = '';
                    form.rangoIngreso = '';
                    form.genero = '';
                    form.gradoAcademico = [];
                    form.mensaje = '';
                    enviando.value = false;

                    setTimeout(() => {
                        mensajeEstado.value = '';
                        claseEstado.value = '';
                    }, 4000);
                })
                .catch((error) => {
                    mensajeEstado.value = 'Hubo un error al enviar el mensaje. Intentá de nuevo.';
                    claseEstado.value = 'text-danger';
                    enviando.value = false;
                    console.error('Error EmailJS:', error);
                });
        }

        return {
            form,
            opcionesGenero,
            opcionesGrado,
            edad,
            enviando,
            mensajeEstado,
            claseEstado,
            enviarFormulario
        };
    }
}).mount('#appContacto');
