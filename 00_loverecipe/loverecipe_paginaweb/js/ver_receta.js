const cuadro_titulo = document.querySelector("#cuadro_titulo");
const cuadro_descripcion = document.querySelector("#cuadro_descripcion");
const ver_contenido = document.querySelector("#ver_contenido");
const PreviewImagenComida = document.querySelector("#PreviewImagenComida");

const idReceta = localStorage.getItem("recetaId");//recetaId q viene del localstorage de catalogo.js


fetch("http://localhost:3000/obtener_ver_receta_" + idReceta).then(respuesta => respuesta.json()).then(receta => {

    cuadro_titulo.textContent = receta.titulo;
    cuadro_descripcion.textContent = receta.descripcion;
    ver_contenido.innerHTML = receta.contenido;
    PreviewImagenComida.src = receta.imagen;
});

function volverCatalogo() {
    window.location.href = "catalogo.html";
}