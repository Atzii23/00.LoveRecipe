//tarejetona cklon
const tarjeta_receta = document.querySelector(".tarjeta_receta");
tarjeta_receta.remove();
const contenedor_tarjetas = document.querySelector("#contenedor_tarjetas");

// 
function calificarEstrellas(estrellasTarjeta, puntuacion){
    for(let j = 0; j < estrellasTarjeta.length; j++){
        const estrellaActual = estrellasTarjeta[j];//va sacando una estrella una por una
        const valor = parseInt(estrellaActual.getAttribute("data-value"), 10);//convierte a entero data-value para ser comparada

        //va calculando el valor estrella por estrella
        //valor va de 1 al 5, puntuacion es lo que escoje el usuario
        if(valor <= puntuacion){
            estrellaActual.classList.add("filled");
        }else{
            estrellaActual.classList.remove("filled");
        }
    }
}



fetch("http://localhost:3000/obtener_recetas").then(recurso => recurso.json()).then(respuesta => {
    for (i = 0; i < respuesta.listaRecetas.length; i++) {

        const recetaActu = respuesta.listaRecetas[i];

        const cloneTarjeta = tarjeta_receta.cloneNode(true);
        contenedor_tarjetas.appendChild(cloneTarjeta);

        const titulo_tarjeta = cloneTarjeta.querySelector(".titulo_tarjeta");
        titulo_tarjeta.innerHTML = recetaActu.titulo;

        const descripcion_tarjeta = cloneTarjeta.querySelector(".descripcion_tarjeta");
        descripcion_tarjeta.innerHTML = recetaActu.descripcion;

        const tarjeta_imagen = cloneTarjeta.querySelector("img");
        tarjeta_imagen.src = recetaActu.imagen;

        const estrellasTarjeta = cloneTarjeta.querySelectorAll(".estrella");

        const puntuacionGuardada = parseInt(recetaActu.puntuacion, 10) || 0; //convierte la puntuacion a numero entero, si no hay nada dentro al ser guardada le pone de valor 0, esto lo saca de la base y lo muestra en el front

        calificarEstrellas(estrellasTarjeta, puntuacionGuardada);//llama la funcion

        for (let j = 0; j < estrellasTarjeta.length; j++) {
                const estrella = estrellasTarjeta[j];

                //les da el detector de kuando son clickeadas
                estrella.addEventListener("click", (event) => {
                    event.stopPropagation(); //evita que se abra para ver receta

                    //saca el valor de la estrella que toco el usuario y la hace entera, luego pasa por la funcion para compararlas y mostrarlas
                    const nuevaPuntuacion = parseInt(estrella.getAttribute("data-value"), 10);
                    calificarEstrellas(estrellasTarjeta, nuevaPuntuacion);

                    fetch("http://localhost:3000/calificar_receta", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            id: recetaActu.id,
                            calificacion: nuevaPuntuacion
                        })
                    }).then(recurso => recurso.json()).then(respuesta => {
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
            localStorage.setItem("recetaId", recetaActu.id); //etiqueta //valor                                
            window.location.href = "ver_receta.html";
        });

        const editar = cloneTarjeta.querySelector(".editar");
        editar.addEventListener("click", () => {
            event.stopPropagation();//detiene el evento anterior
        
            localStorage.setItem("editarRecId", recetaActu.id);
            window.location.href = "Crear_receta.html";
        });

        const eliminar = cloneTarjeta.querySelector(".eliminar");
        eliminar.addEventListener("click", () => {
            event.stopPropagation();

            const objeto_receta_borrar = {
                id: recetaActu.id
            }
            
            if(confirm("Estas seguro de que quieres borrar esta tarjeta?")){
                fetch("http://localhost:3000/borrarTarjeta", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json"},
                    body: JSON.stringify(objeto_receta_borrar)
                }).then(recurso => recurso.json()).then(respuesta => {
                    alert(respuesta.mensaje);
                    cloneTarjeta.remove();
                })
            }

            
        });

        


    }

    
});


