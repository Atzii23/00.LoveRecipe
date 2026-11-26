//Tarjeta klon
const tarjeta_receta = document.querySelector(".tarjeta_receta");
tarjeta_receta.remove();
const contenedor_tarjetas = document.querySelector("#contenedor_tarjetas");

//Buscador
const input_busqueda = document.querySelector("#input_busqueda");
let todasLasRecetas = [];//guarda por mientras las estrellas en una caja vacia

//pinta las estrellitas
function calificarEstrellas(estrellasTarjeta, puntuacion) {
    for (let j = 0; j < estrellasTarjeta.length; j++) {
        const estrellaActual = estrellasTarjeta[j];//va sacando una estrella una por una
        const valor = parseInt(estrellaActual.getAttribute("data-value"), 10);//convierte a entero data-value para ser comparada

        //va calculando el valor estrella por estrella
        //valor va de 1 al 5, puntuacion es lo que escoje el usuario
        if (valor <= puntuacion) {
            estrellaActual.classList.add("filled");
        } else {
            estrellaActual.classList.remove("filled");
        }
    }
}

//muestra las tarjetas
function renderizarRecetas(lista) {
    contenedor_tarjetas.innerHTML = "";//es para que al momento de buscar las tarjetas no salgan todas y evita q no salgan doble

    //lista son la informacion que tiene, osea es quien ve cuantas tarjetas son, pasa a const recetaActu que termina recibiendo eso, entonces ya sigue lo demas de poner los datos
    for (let i = 0; i < lista.length; i++) {
        const recetaActu = lista[i];

        const cloneTarjeta = tarjeta_receta.cloneNode(true);
        contenedor_tarjetas.appendChild(cloneTarjeta);

        const titulo_tarjeta = cloneTarjeta.querySelector(".titulo_tarjeta");
        titulo_tarjeta.innerHTML = recetaActu.titulo;

        const descripcion_tarjeta = cloneTarjeta.querySelector(".descripcion_tarjeta");
        descripcion_tarjeta.innerHTML = recetaActu.descripcion;

        const tarjeta_imagen = cloneTarjeta.querySelector("img");
        tarjeta_imagen.src = recetaActu.imagen;

        //calificaion
        const estrellasTarjeta = cloneTarjeta.querySelectorAll(".estrella");
        const puntuacionGuardada = parseInt(recetaActu.puntuacion, 10) || 0;//convierte la puntuacion a numero entero, si no hay nada dentro al ser guardada le pone de valor 0, esto lo saca de la base y lo muestra en el front
        calificarEstrellas(estrellasTarjeta, puntuacionGuardada);//llama la funcion

        for (let j = 0; j < estrellasTarjeta.length; j++) {
            const estrella = estrellasTarjeta[j];

            //les da el detector de kuando son clickeadas
            estrella.addEventListener("click", (event) => {
                event.stopPropagation(); //evita que se abra para ver receta

                //saca el valor de la estrella que toco el usuario y la hace entera, luego pasa por la funcion para compararlas y mostrarlas
                const nuevaPuntuacion = parseInt(estrella.getAttribute("data-value"), 10);
                calificarEstrellas(estrellasTarjeta, nuevaPuntuacion);
                recetaActu.puntuacion = nuevaPuntuacion;

                fetch("http://localhost:3000/calificar_receta", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: recetaActu.id,
                        calificacion: nuevaPuntuacion
                    })
                })
                    .then(recurso => recurso.json())
                    .then(respuesta => {
                        console.log(respuesta.mensaje);
                    })
                    .catch(error => {
                        console.log("Error al guardar calificación:", error);
                    });
            });
        }

        
        cloneTarjeta.style.cursor = "pointer";

        //al tocar la tarjeta se puede ver el interior
        cloneTarjeta.addEventListener("click", () => {

            //memoria temporal q guarda el valor para encontarlo despues            
            localStorage.setItem("recetaId", recetaActu.id);//etiqueta //valor
            window.location.href = "ver_receta.html";
        });

        //editar
        const editar = cloneTarjeta.querySelector(".editar");
        
        editar.addEventListener("click", (event) => {
            event.stopPropagation();//detiene el evento anterior

            localStorage.setItem("editarRecId", recetaActu.id);
            window.location.href = "Crear_receta.html";
        });
        

        //Eliminar
        const eliminar = cloneTarjeta.querySelector(".eliminar");
        
        eliminar.addEventListener("click", (event) => {
            event.stopPropagation();

            const objeto_receta_borrar = {
                id: recetaActu.id
            };

            if (confirm("Estas seguro de que quieres borrar esta tarjeta?")) {
                fetch("http://localhost:3000/borrarTarjeta", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(objeto_receta_borrar)
                }).then(recurso => recurso.json()).then(respuesta => {
                    alert(respuesta.mensaje);
                    //lo que hace es que de todas las recetas va buscando la que debe fue borrada para actualizar las demas
                    todasLasRecetas = todasLasRecetas.filter(resp => resp.id !== recetaActu.id);
                    cloneTarjeta.remove();
                });
            }
                
         });
    }
}

// Carga inicial de recetas desde la API
fetch("http://localhost:3000/obtener_recetas").then(recurso => recurso.json()).then(respuesta => {
    todasLasRecetas = respuesta.listaRecetas;//listaRecetas viene de la api en donde junte todo lo que engloba las recetas
    renderizarRecetas(todasLasRecetas);//manda a llamar a todas las recetas 
});

//Es la parte que hace que el filtro funcione
//el evento es para q haga la funcion cada vez q el usuario escriba
input_busqueda.addEventListener("input", () => {
    //.trim() elimina espacios en blanco que deje el usuario al momento de escribir
    const texto = input_busqueda.value.trim().toLowerCase();//convierte el texto que escribe el usuario a minusculas para hacer mas facil su busqueda

    const filtradas = todasLasRecetas.filter(receta => {
        const titulo = (receta.titulo || "").toLowerCase();
        return titulo.includes(texto);//.includes() actua como un if/booleano, devuelve verdadero si el titulo coincide con lo que mando el cliente
    });

    renderizarRecetas(filtradas); //llama a la funcion renderizarRecetas y ejecutan el for de adentro, mostrando solo las tarjetas que pidio el usuario
});
