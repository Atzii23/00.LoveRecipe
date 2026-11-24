const nombreUsuario = document.querySelector("#nombreUsuario");
const contrasena = document.querySelector("#contrasena");

function hacerLogin() {
    const objeto = {
        usuario: nombreUsuario.value,
        contrasena: contrasena.value
    };

    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objeto)
    }).then(recurso => recurso.json().then(respuesta => ({ status: recurso.status, respuesta }))).then(({ status, respuesta }) => {
        if (status === 200) { //si funciona guarda respuesta.token y lleva al usuario a index.html
            sessionStorage.setItem("token_sesion", respuesta.token);
            window.location.href = "index.html";
        } else {
            alert(respuesta.mensaje);
        }
    });
}