const http = require("node:http");
const basesdatos = require("mysql");
const { json } = require("node:stream/consumers");

const jwt = require("jsonwebtoken");
const { info } = require("node:console");
const llave = "vdwbiuknsna"

const puerto = 3000;

const server = http.createServer((request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    response.setHeader("Access-Control-Allow-Headers", "*");

    const mysql = basesdatos.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "recipelove_db"
    });

    switch (request.method) {
        case "GET":

            switch (request.url) {
                case "/obtener_id_usuarios":
                    mysql.query("SELECT id FROM usuarios", (err, resultado) => {
                        if (err) {
                            console.log(err);
                            mysql.end();
                            return;
                        }

                        const arreglo_ids_usuarios = {
                            ids: resultado
                        };

                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'application/json');
                        response.end(JSON.stringify(arreglo_ids_usuarios));
                        mysql.end();
                    });
                    break;

                case "/obtener_recetas":
                    mysql.query("SELECT id, titulo, descripcion, imagen, contenido, favorito, puntuacion FROM recetas", (err, resultado) => {
                        if (err) {
                            console.log(err);
                            mysql.end();
                            return;
                        }

                        const recetas = []; //las recetas despues de pasar por el for se guardan aca

                        for (i = 0; i < resultado.length; i++) {
                            const receta = {
                                id: resultado[i].id,
                                titulo: resultado[i].titulo,
                                descripcion: resultado[i].descripcion,
                                imagen: "data:;base64," + resultado[i].imagen.toString("base64"),
                                contenido: resultado[i].contenido,
                                favorito: resultado[i].favorito,
                                puntuacion: resultado[i].puntuacion
                            };

                            recetas.push(receta);//hace que las recetas que se publiquen se agreguen al final


                        }

                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'application/json');
                        response.end(JSON.stringify({
                            listaRecetas: recetas
                        }));//listaRecetas guarda todo lo que compone 'recetas' para hacerlo mas ordenado
                        mysql.end();
                    });

                    break;

                case "/obtener_ver_receta":

                    mysql.query("SELECT id, titulo, descripcion, imagen, contenido FROM recetas", (err, resultado) => {
                        if (err) {
                            console.log(err);
                            mysql.end();
                            return;
                        }

                        const recetas = []; //las recetas despues de pasar por el for se guardan aca

                        for (i = 0; i < resultado.length; i++) {
                            const receta = {
                                id: resultado[i].id,
                                titulo: resultado[i].titulo,
                                descripcion: resultado[i].descripcion,
                                imagen: "data:;base64," + resultado[i].imagen.toString("base64"),
                                contenido: resultado[i].contenido,
                            };

                            recetas.push(receta);//hace que las recetas que se publiquen se agreguen al final


                        }

                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'application/json');
                        response.end(JSON.stringify({
                            listaRecetas: recetas
                        }));//listaRecetas guarda todo lo que compone 'recetas' para hacerlo mas ordenado
                        mysql.end();
                    });

                    break;

                case "/obtener_usuario":
                    const token = request.headers.authorization;

                    //verifica q el token no llegue vacio
                    if (!token || token == null || token == "null" || token == undefined) {
                        response.statusCode = 401;
                        response.setHeader('Content-Type', 'application/json');
                        response.end(JSON.stringify({
                            mensaje: "Token no proporcionado"
                        }));
                        return;
                    }

                    //es cuando intentan modificar/inventarse un token, tambien cuando paso el tiempo de uso del token
                    jwt.verify(token, llave, (err, decoded) => {
                        if (err) {
                            response.statusCode = 401;
                            response.setHeader('Content-Type', 'application/json');
                            response.end(JSON.stringify({
                                mensaje: "Token es no válido o está expirado"
                            }));
                            return;
                        }

                        //decoded es el token desenvuelto q se guardo en el /login
                        //el sql se pone para ver si el usuario aun existe, mas q nada por si se borro o algo asi
                        mysql.query("SELECT id, nombre FROM usuarios WHERE nombre = ?", [decoded.username], (err, resultado) => {

                            //falla en la base
                            if (err) {
                                console.log(err);
                                response.statusCode = 400;
                                response.setHeader("Content-Type", "application/json");
                                response.end(JSON.stringify({
                                    mensaje: "Error al obtener usuario"
                                }));
                                mysql.end();
                                return;
                            }

                            //si no encontro al usuario
                            if (resultado.length === 0) {
                                response.statusCode = 404;
                                response.setHeader("Content-Type", "application/json");
                                response.end(JSON.stringify({
                                    mensaje: "Usuario no encontrado"
                                }));
                                mysql.end();
                                return;
                            }

                            //lo encontro
                            response.statusCode = 200;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify({
                                mensaje: "Usuario validado",
                                id: resultado[0].id,
                                usuario: decoded
                            }));
                            mysql.end();
                        });
                    });
                    break;

                default:
                    if (request.url.startsWith("/obtener_usuario_")) {
                        const id = request.url.replace("/obtener_usuario_", "");

                        mysql.query("SELECT nombre FROM usuarios WHERE id = " + id, (err, resultado) => {
                            if (err) {
                                console.log(err);
                                response.statusCode = 404;
                                response.setHeader('Content-Type', 'application/json');
                                response.end(JSON.stringify({
                                    mensaje: "peticion no valida"
                                }));
                                mysql.end();
                                return;
                            }

                            if (resultado.length == 0) {
                                response.statusCode = 404;
                                response.setHeader('Content-Type', 'application/json');
                                response.end(JSON.stringify({
                                    mensaje: "no existe un usuario con ese id"
                                }));
                                mysql.end();
                                return;
                            }

                            const nombres_usuario = {
                                nombres: resultado[0].nombre
                            };

                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'application/json');
                            response.end(JSON.stringify(nombres_usuario));
                            mysql.end();
                        });
                    }
                    else if (request.url.startsWith("/obtener_ver_receta_")) {
                        const id = request.url.replace("/obtener_ver_receta_", "");

                        mysql.query("SELECT id, titulo, descripcion, imagen, contenido FROM recetas WHERE id = " + id, (err, resultado) => {
                            if (err) {
                                console.log(err);
                                response.statusCode = 404;
                                response.setHeader("Content-Type", "application/json");
                                response.end(JSON.stringify({
                                    mensaje: "peticion no valida"
                                }));
                                mysql.end();
                                return;
                            }

                            if (resultado.length == 0) {
                                response.statusCode = 404;
                                response.setHeader("Content-Type", "application/json");
                                response.end(JSON.stringify({
                                    mensaje: "no existe una receta con ese id"
                                }));
                                mysql.end();
                                return;
                            }

                            const fila = resultado[0];

                            const receta = {
                                id: fila.id,
                                titulo: fila.titulo,
                                descripcion: fila.descripcion,
                                imagen: "data:;base64," + fila.imagen.toString("base64"),
                                contenido: fila.contenido
                            };

                            response.statusCode = 200;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify(receta));
                            mysql.end();
                        });
                    }
                    break;

            }
            break;

        case "POST":

            switch (request.url) {
                case "/CrearReceta":
                    //la foto se manda en pedacitos pq son pesadas
                    var informacion = "";

                    request.on("data", info => {
                        informacion += info;
                    });

                    request.on("end", () => {
                        const objeto_nuevo_item_receta = JSON.parse(informacion);

                        let imagen_binario = null;
                        if (
                            objeto_nuevo_item_receta.imagen &&
                            objeto_nuevo_item_receta.imagen !== "null" &&
                            objeto_nuevo_item_receta.imagen.includes(",")
                        ) {
                            const imagen_base64 = objeto_nuevo_item_receta.imagen.split(",")[1];
                            imagen_binario = Buffer.from(imagen_base64, "base64");
                        }

                        mysql.query("INSERT INTO recetas (titulo, descripcion, imagen, contenido) VALUES (?, ?, ?, ?)",
                            [objeto_nuevo_item_receta.titulo, objeto_nuevo_item_receta.descripcion, imagen_binario, objeto_nuevo_item_receta.contenido], (err, resultado) => {
                                if (err) {
                                    console.log(err);
                                    response.statusCode = 400;
                                    response.setHeader("Content-Type", "application/json");
                                    response.end(JSON.stringify({
                                        mensaje: "Error al crear receta. Pruebe más tarde"
                                    }));
                                    mysql.end();
                                    return;
                                }

                                response.statusCode = 200;
                                response.setHeader("Content-Type", "application/json");
                                response.end(JSON.stringify({
                                    mensaje: "se ha subido correctamente la receta"
                                }));
                                mysql.end();
                            });
                    });

                    break;

                case "/login":
                    var informacion = "";

                    request.on("data", info => {
                        informacion += info;
                    });

                    request.on("end", () => {
                        const login = JSON.parse(informacion);

                        //s algo donde dice selecciona id, nombre de la tabla usuarios en donde el nombre y contrasena son ? solamente si el login.usuario y contrasena son iguales a los de la base de datos
                        mysql.query("SELECT id, nombre FROM usuarios WHERE nombre = ? AND contrasena = ?", [login.usuario, login.contrasena], (err, resultado) => {
                            // de no ser asi arroja los if, pero si es correcto se ejecuta el const token
                            if (err) {
                                console.log(err);
                                response.statusCode = 400;
                                response.setHeader("Content-Type", "application/json");
                                response.end(JSON.stringify({
                                    mensaje: "Error al iniciar sesion"
                                }));
                                mysql.end();
                                return;
                            }

                            //si es que ni encontro ninguno en la tabla sql
                            if (resultado.length === 0) {

                                response.statusCode = 401;
                                response.setHeader("Content-Type", "application/json");
                                response.end(JSON.stringify({
                                    mensaje: "Usuario o contrasena incorrectos"
                                }));
                                mysql.end();
                                return;
                            }

                            //da el token solo si el id y nombre son iguales a la de la base de datos, es cuando les da el token con la llave y la duracion de esta que son 30s
                            const token = jwt.sign({ id: resultado[0].id, username: resultado[0].nombre }, llave, { expiresIn: "30s" });
                            response.statusCode = 200;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify({
                                mensaje: "Login exitoso",
                                token: token
                            }));
                            mysql.end();
                        });
                    });

                    break;

                case "/calificar_receta":
                    var informacion = "";

                    request.on("data", info => {
                        informacion += info;
                    });

                    request.on("end", () => {
                        const datosCalificacion = JSON.parse(informacion);

                        mysql.query("UPDATE recetas SET puntuacion = ? WHERE id = ?", [datosCalificacion.calificacion, datosCalificacion.id], (err, resultado) => {
                            if (err) {
                                console.log(err);
                                response.statusCode = 400;
                                response.setHeader("Content-Type", "application/json");
                                response.end(JSON.stringify({
                                    mensaje: "Error al guardar la puntuación"
                                }));
                                mysql.end();
                                return;
                            }

                            response.statusCode = 200;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify({
                                mensaje: "Puntuación guardada correctamente"
                            }));
                            mysql.end();
                        }
                        );
                    });

                    break;
            }

            break;

        case "PUT":
            if (request.url.startsWith("/ActualizarReceta_")) {
                const id = request.url.replace("/ActualizarReceta_", "");

                var informacion = ""; //la foto se manda en pedacitos porque son pesadas

                request.on("data", info => {
                    informacion += info;
                });

                request.on("end", () => {
                    const objeto_receta_editada = JSON.parse(informacion);//es la foto 

                    let imagen_binario = null;

                    //revisa que la imagen exista, no sea texto 'null' y q contenga la (,)
                    if (objeto_receta_editada.imagen && objeto_receta_editada.imagen !== "null" && objeto_receta_editada.imagen.includes(",")) {
                        const imagen_base64 = objeto_receta_editada.imagen.split(",")[1];
                        imagen_binario = Buffer.from(imagen_base64, "base64");
                    }
                    //si no pasa el if imageb_binario queda igual en null y no rompe nada

                    //el if es para ver si la imgen esta ahi oq 
                    if (imagen_binario) {
                        mysql.query("UPDATE recetas SET titulo = ?, descripcion = ?, imagen = ?, contenido = ? WHERE id = ?", [objeto_receta_editada.titulo, objeto_receta_editada.descripcion, imagen_binario, objeto_receta_editada.contenido, id], (err, resultado) => {
                            if (err) {
                                console.log(err);
                                response.statusCode = 400;
                                response.setHeader("Content-Type", "application/json");
                                response.end(JSON.stringify({
                                    mensaje: "Error al actualizar. Pruebe mas tarde"
                                }));
                                mysql.end();
                                return;
                            }

                            response.statusCode = 200;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify({
                                mensaje: "Se ha actualizado correctamente"
                            }));
                            mysql.end();
                        }
                        );
                    } else {//en caso de q la imagen sea null se queda con la anterior, la q se habia mandado anteriormente enel post
                        mysql.query("UPDATE recetas SET titulo = ?, descripcion = ?, contenido = ? WHERE id = ?", [objeto_receta_editada.titulo, objeto_receta_editada.descripcion, objeto_receta_editada.contenido, id], (err, resultado) => {
                            if (err) {
                                console.log(err);
                                response.statusCode = 400;
                                response.setHeader("Content-Type", "application/json");
                                response.end(JSON.stringify({
                                    mensaje: "Error al actualizar receta. Pruebe más tarde"
                                }));
                                mysql.end();
                                return;
                            }

                            response.statusCode = 200;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify({
                                mensaje: "se ha actualizado correctamente la receta"
                            }));
                            mysql.end();
                        }
                        );
                    }
                });
            }
            break;

        case "DELETE":
            if (request.url === "/borrarTarjeta") {
                let informacion = "";

                request.on("data", info => {
                    informacion += info;
                });

                request.on("end", () => {
                    const objeto_tarjeta_borrar = JSON.parse(informacion);

                    mysql.query("DELETE FROM recetas WHERE id = ?", [objeto_tarjeta_borrar.id], (err, resultado) => {
                        if (err) {
                            console.log(err);
                            response.statusCode = 400;
                            response.setHeader('Content-Type', 'application/json');
                            response.end(JSON.stringify({
                                mensaje: "Error al borrar receta"
                            }));
                            mysql.end();
                            return;
                        }
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'application/json');
                        response.end(JSON.stringify({
                            mensaje: "Receta eliminada correctamente"
                        }));

                        mysql.end();
                    })
                });
            }

            break;
        case "OPTIONS":
            response.writeHead(204);
            response.end();
            break;


    }
});

server.listen(puerto, () => {
    console.log("servidor a la escucha en http://localhost:" + puerto);
});