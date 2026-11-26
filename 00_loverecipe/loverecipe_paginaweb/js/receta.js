//botones-funcionalidad
document.getElementById('bold').addEventListener('click', () => {
    document.execCommand('bold', false, null);
});

document.getElementById('italic').addEventListener('click', () => {
    document.execCommand('italic', false, null);
});

document.getElementById('underline').addEventListener('click', () => {
    document.execCommand('underline', false, null);
});

document.getElementById('strikethrough').addEventListener('click', () => {
    document.execCommand('strikethrough', false, null);
});

//--------------alineacion
document.getElementById('alignLeft').addEventListener('click', () => {
    document.execCommand('justifyLeft', false, null);
});

document.getElementById('alignCenter').addEventListener('click', () => {
    document.execCommand('justifyCenter', false, null);
});

document.getElementById('alignRight').addEventListener('click', () => {
    document.execCommand('justifyRight', false, null);
});

document.getElementById('alignJustify').addEventListener('click', () => {
    document.execCommand('justifyFull', false, null);
});

//-------------lista de letras
document.getElementById('orderedList').addEventListener('click', () => {
    document.execCommand('insertOrderedList', false, null);
});

document.getElementById('unorderedList').addEventListener('click', () => {
    document.execCommand('insertUnorderedList', false, null);
});

//-------------selector de fuente
document.getElementById('font').addEventListener('change', (e) => {
    document.execCommand('fontName', false, e.target.value);
});

//--------------tamaño fuente
document.getElementById('fontSize').addEventListener('change', (e) => {
    document.execCommand('fontSize', false, e.target.value);
});

//api

const CrearReceta_titulo = document.querySelector(".CrearReceta_titulo");
const CrearReceta_descripcion = document.querySelector(".CrearReceta_descripcion");
const Input_imagen = document.querySelector(".Input_imagen");
const textArea = document.querySelector("#textArea");
const PreviewImagenComida = document.querySelector("#PreviewImagenComida");

const btnGuardarReceta = document.querySelector("#btn_guardar_receta");

Input_imagen.addEventListener("change", () => {
    const archivo = Input_imagen.files[0];
    if (!archivo) return;//si no hay archivo para hasta que otro evento tome su lugar

    const reader = new FileReader();
    reader.readAsDataURL(archivo);
    reader.onload = () => {
        PreviewImagenComida.src = reader.result;
    };
});

const idEditarRec = localStorage.getItem("editarRecId");

if (idEditarRec) {
    fetch("http://localhost:3000/obtener_ver_receta_" + idEditarRec).then(recurso => recurso.json()).then(respuesta => {
        CrearReceta_titulo.value = respuesta.titulo;
        CrearReceta_descripcion.value = respuesta.descripcion;
        textArea.innerHTML = respuesta.contenido;
        //ve si la receta tiene una imagen valida
        if (respuesta.imagen) {
            PreviewImagenComida.src = respuesta.imagen;
        }
    });
}

btnGuardarReceta.addEventListener("click", () => {

    //empaque q empaqueta el valor q el usuario ponga em el 
    const objeto_receta = {
        titulo: CrearReceta_titulo.value,
        descripcion: CrearReceta_descripcion.value,
        imagen: PreviewImagenComida.src,
        contenido: textArea.innerHTML
    };

    let url = "";
    let metodo = "";

    //verifica si se edita o se postea la info ya que estan en la misma hoja html
    if (idEditarRec) {
        url = "http://localhost:3000/ActualizarReceta_" + idEditarRec;
        metodo = "PUT";
    } else {
        url = "http://localhost:3000/CrearReceta";
        metodo = "POST";
    }

    fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objeto_receta)
    }).then(recurso => { recurso.json().then(respuesta => {
            if (recurso.status == 200) {
                localStorage.removeItem("editarRecId");//borra la notita del id de la ediccion para q no se quede pegada la proxima vez q se abra la tarjeta
                window.location.href = "catalogo.html";
            }
        });
    });
});

function volverCatalogo() {
    window.location.href = "catalogo.html";
}

