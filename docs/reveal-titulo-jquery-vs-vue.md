# Animación "reveal" de títulos: Vanilla JS vs jQuery vs Vue.js

Este documento explica el código actual de `js/principal.js` (líneas 9-58), qué cambia
conceptualmente entre jQuery y Vue, y te da los pasos para adaptarlo vos mismo.
El objetivo del PDF del proyecto es que uses **una biblioteca (jQuery o Vue) para
manipular/validar el DOM** — así que con adaptar uno de los dos bloques ya cumplís
el requisito.

## 1. Qué hace el código actual

```js
const tituloConsejo = document.querySelector('.reveal-consejo');
if (tituloConsejo) {
    const texto = tituloConsejo.textContent;
    tituloConsejo.textContent = '';
    [...texto].forEach((letra, i) => {
        const span = document.createElement('span');
        span.textContent = letra === ' ' ? ' ' : letra;
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
```

Tres pasos, siempre:

1. **Busca** el título (`querySelector`).
2. **Reconstruye** su texto letra por letra, cada letra en su propio `<span>` con un
   `transition-delay` distinto (así se van iluminando una por una — el efecto lo hace
   el CSS de `.reveal-consejo span` en `home.css`, este JS solo arma el HTML).
3. **Observa** cuándo el título entra en pantalla (`IntersectionObserver`) y le agrega/quita
   la clase `.visible`, que es la que dispara la transición en CSS.

El bloque de `.reveal-titulo` (FAQ) hace exactamente lo mismo, solo cambia el selector y
el delay (`0.05s` en vez de `0.07s`).

## 2. Qué cambia conceptualmente entre las tres

| | Vanilla JS (actual) | jQuery | Vue.js |
|---|---|---|---|
| **Selección de elementos** | `document.querySelector('.x')` | `$('.x')` | no seleccionás nada a mano — el template ya "sabe" qué renderizar |
| **Creación de elementos** | `document.createElement` + `appendChild` (manual) | `$('<span>')` + `.appendTo()` (más corto, sigue siendo manual) | `v-for` en el template — vos declarás *qué* querés ver, Vue arma el DOM solo |
| **Cambiar clases/estilos** | `classList.add/remove`, `el.style.x` | `.addClass()/.removeClass()`, `.css()` | `:class="{visible: bool}"`, `:style="..."` — reactivo, ligado a una variable |
| **Modelo mental** | *Imperativo*: "hacé esto, después esto, después esto" | *Imperativo*, pero con menos código repetitivo | *Declarativo*: "el template siempre refleja el estado" — vos cambiás una variable y la vista se actualiza sola |
| **Qué tan distinto es del código actual** | — | Casi un traducción directa, línea por línea | Requiere pensar el título como *datos* (array de letras + un booleano `visible`), no como pasos |

En criollo: **jQuery es el mismo código, con nombres más cortos.** **Vue es repensar el
problema**: en vez de "crear spans e ir agregando clases", pensás "tengo un array de
letras y un estado `visible`, y el HTML se dibuja solo en base a eso".

## 3. Paso a paso: adaptarlo a jQuery

### Paso 1 — Agregar jQuery al `<head>` (o antes de `principal.js`)

En cada HTML, agregá esto **antes** de `<script src="js/principal.js">`:

```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
```

### Paso 2 — Cambiar la selección

```js
// Antes
const tituloConsejo = document.querySelector('.reveal-consejo');
if (tituloConsejo) { ... }

// Con jQuery
const $tituloConsejo = $('.reveal-consejo');
if ($tituloConsejo.length) { ... }   // jQuery no da null, da un objeto vacío — length dice si existe
```

### Paso 3 — Cambiar la creación de los `<span>`

```js
// Antes
const texto = tituloConsejo.textContent;
tituloConsejo.textContent = '';
[...texto].forEach((letra, i) => {
    const span = document.createElement('span');
    span.textContent = letra === ' ' ? ' ' : letra;
    span.style.transitionDelay = `${i * 0.07}s`;
    tituloConsejo.appendChild(span);
});

// Con jQuery
const texto = $tituloConsejo.text();
$tituloConsejo.empty();
[...texto].forEach((letra, i) => {
    $('<span>')
        .text(letra === ' ' ? ' ' : letra)
        .css('transition-delay', `${i * 0.07}s`)
        .appendTo($tituloConsejo);
});
```

### Paso 4 — El `IntersectionObserver` casi no cambia

jQuery no tiene un reemplazo propio para `IntersectionObserver` (es una API del
navegador, no del DOM que jQuery envuelve), así que se mezcla con jQuery solo para
tocar clases:

```js
const consejoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        $(entry.target).toggleClass('visible', entry.isIntersecting);
    });
}, { threshold: 0.5, rootMargin: '0px 0px -10% 0px' });

consejoObserver.observe($tituloConsejo[0]); // observe() pide un elemento nativo, no un objeto jQuery
```

> Nota: mezclar jQuery con APIs nativas (como acá) es completamente normal y válido —
> jQuery no "reemplaza" el navegador, solo simplifica la manipulación del DOM.

### Tu turno: el bloque de `.reveal-titulo` (FAQ)

Es el mismo patrón exacto, cambiando `.reveal-consejo` → `.reveal-titulo` y `0.07` → `0.05`.
Intentá escribirlo vos siguiendo los 4 pasos de arriba antes de mirar la solución —
es literalmente copiar la estructura y cambiar el selector.

## 4. Paso a paso: adaptarlo a Vue.js

Vue no encaja tan bien con "una función suelta en `principal.js`" — necesita un
elemento raíz que controle. Esto implica tocar un poco el HTML.

### Paso 1 — Agregar Vue al `<head>`

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
```

### Paso 2 — Marcar el título como una "isla" de Vue en el HTML

```html
<!-- home.css ya tiene los estilos de .reveal-consejo, no hace falta tocarlos -->
<h2 id="tituloConsejosApp" class="seccion-titulo text-center reveal-consejo"
    :class="{ visible: visible }">
    <span v-for="(letra, i) in letras" :key="i" :style="{ transitionDelay: (i * 0.07) + 's' }">{{ letra === ' ' ? ' ' : letra }}</span>
</h2>
```

Ojo: el texto "Consejos" ya no va como texto plano del `<h2>` — ahora vive en `data()`
como un array de letras, y el `v-for` arma los `<span>` por vos.

### Paso 3 — Crear la instancia de Vue (en `principal.js` o un script aparte)

```js
const { createApp, ref, onMounted } = Vue;

createApp({
    setup() {
        const textoOriginal = 'Consejos';
        const letras = [...textoOriginal];
        const visible = ref(false);

        onMounted(() => {
            const el = document.getElementById('tituloConsejosApp');
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    visible.value = entry.isIntersecting;
                });
            }, { threshold: 0.5, rootMargin: '0px 0px -10% 0px' });
            observer.observe(el);
        });

        return { letras, visible };
    }
}).mount('#tituloConsejosApp');
```

Compará esto con el jQuery de arriba: **no hay `createElement`, `appendChild` ni
`classList`.** Vos solo cambiás `visible.value` y Vue actualiza la clase `:class` sola,
porque el template está *ligado* (bound) a esa variable.

### Por qué Vue es más trabajo acá

- Tenés que mover el texto del HTML al JS (`data`/`setup`).
- Necesitás un `id` nuevo en el HTML para que Vue "monte" ahí.
- Si más adelante tenés varios títulos con este efecto, en Vue conviene armar un
  **componente reutilizable** (`<TituloReveal texto="Consejos" delay="0.07" />`), lo cual
  es más potente pero también más para aprender de una sola vez.

## 5. ¿Cuál conviene para el proyecto?

Para el requisito puntual del PDF ("código en JQuery, VUE.js u otra para acciones o
validaciones en el DOM"), **jQuery es el camino corto**: mismo comportamiento, cambios
mínimos, no tenés que reestructurar el HTML. Vue es más para aprender el framework en
sí — vale la pena si en algún momento vas a construir algo más grande con estado
(un carrito, un formulario dinámico, etc.), pero es más inversión para este caso puntual.

## 6. Checklist para verificar que funcionó

- [ ] El título sigue apareciendo letra por letra al hacer scroll (mismo efecto visual de antes).
- [ ] Si scrolleás para arriba y volvés a bajar, el efecto se repite (por el `entry.isIntersecting` que agrega *y quita* `.visible`).
- [ ] Abrís la consola del navegador (F12) y no hay errores en rojo.
- [ ] Si usaste jQuery: el `<script>` de jQuery está *antes* que `principal.js` en el HTML (si no, `$` no existe todavía cuando corre tu código).
- [ ] Si usaste Vue: el `id` del HTML coincide exactamente con el `.mount('#...')` del JS.
