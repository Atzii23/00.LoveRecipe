const personaNoRegistrada = document.querySelector("#persona_no_registrada");
const sesionIniciada = document.querySelector("#SesionIniciada");
const userPerfil = document.querySelector("#userPerfil");
const btnCrearReceta = document.querySelector("#btn_crearReceta");
const botonCerrarSesion = document.querySelector("#listaDesplegable li");

function mostrarVistaSinSesion() {
    sessionStorage.removeItem("token_sesion");//borra el token guardado por si estaba activo ono
    personaNoRegistrada.style.display = "flex";
    sesionIniciada.style.display = "none";//esconde la sesion iniciada
    if (btnCrearReceta) {
        btnCrearReceta.style.display = "none";
    }//revisa si esta el boton q crea la receta, si existe en la vista sin sesion lo apaga
}

function verificarSesion() {
    const token = sessionStorage.getItem("token_sesion");//trae el token de sesion al index

    //revisa si el token existe, si no existe lo interpreta como vista sin iniciar sesion
    if (!token || token === "null" || token === "undefined") {
        mostrarVistaSinSesion();
        return;
    }

    fetch("http://localhost:3000/obtener_usuario", {
        method: "GET",
        //el headers viaja del front al backend 
        headers: {
            "Authorization": token
        }
    }).then(recurso => recurso.json().then(respuesta => ({ status: recurso.status, respuesta }))).then(({ status, respuesta }) => {
        
        //si el token es valido quita la version no registrada y pone la de iniciar sesion
        if (status === 200) {
            personaNoRegistrada.style.display = "none";
            sesionIniciada.style.display = "flex";
            //manda el nombre del usuario al texto que tenia userPerfil
            userPerfil.innerHTML = respuesta.usuario.username;
            if (btnCrearReceta) {
                btnCrearReceta.style.display = "flex";//si esta en linea entonces muestra el boton para editar la receta
            }
        } else {//si no lo manda a la vista no iniciada
            mostrarVistaSinSesion();
        }
    })
}

//ve si esta el token si no hay manda al usuario a iniciar sesion, si esta lo manda a crear receta
function CrearReceta() {
    const token = sessionStorage.getItem("token_sesion");
    if (!token) {
        alert("Inicia sesion primero para crear una receta");
        window.location.href = "iniciar_sesion.html";
        return;
    }
    window.location.href = "Crear_receta.html";
}

if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener("click", () => {
        mostrarVistaSinSesion();
        window.location.href = "index.html";
    });
}

verificarSesion();//vuelve al inicio