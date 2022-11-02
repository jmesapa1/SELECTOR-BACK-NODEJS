import * as functions from "firebase-functions";
import * as express from 'express'
import * as cors from 'cors'
import { iniciarSesion, obtenerToken, RefrescarToken } from "./controllers/AuthController";
import { buscarCancion, guardarCancion, obtenerHistorico } from "./controllers/ClienteController";
import { eliminarCancionElegida, encolarCanciones } from "./controllers/AdminController";
import { db } from "./config/firebase";
import { spotifyApi } from "./config/spotify";

const app = express()
app.use(cors())

app.get('/obtenerurl', iniciarSesion)
app.get('/refrescar', RefrescarToken)

app.post('/capturartoken', obtenerToken)
app.post('/obtenercancion', buscarCancion)
app.post('/almacenarcanciones', guardarCancion)
app.post('/eliminarcancion', eliminarCancionElegida)
app.post('/encolarcancion', encolarCanciones)
app.get('/historico', obtenerHistorico)








exports.app = functions.https.onRequest(app)

exports.scheduledFunction = functions.pubsub.schedule('every 1 minutes').onRun((context) => {
    try {
        db.collection("TOKEN_AUTH").doc("token").get().then((x: any) => {
            let token = x.data().access_token
            spotifyApi.setAccessToken(token)
            spotifyApi.player.getCurrentlyPlayingTrack().then((x: any) => {
                let cancion = {
                    artistas: x.item.artists,
                    imagen: x.item.album.images[0].url,
                    nombre: x.item.name,
                    uri: x.item.uri,
                    popularidad: x.item.popularity,
                    duracion: x.item.duration_ms,
                    id: x.item.id
                }
                db.collection("bar").doc("hoa").collection("reproductor").doc("principal").set(cancion);

            })
        })

    } catch (e) {
        db.collection("error").doc("actual").set({ error: e })

    }
    return null;
})






exports.scheduledFunction = functions.pubsub.schedule('every 40 minutes').onRun((context) => {
    db.collection("TOKEN_AUTH").doc("token").get().then((x: any) => {
        let token = x.data().refresh_token

        spotifyApi.getRefreshedAccessToken(token).then(token_refresh => {
            db.collection("inicio").doc("3").set({ mensaje: "empezo" })
            db.collection("inicio").doc("3").update({ token_anterior: token.access_token })

            db.collection("inicio").doc("3").update({ token_refrescado: token_refresh.access_token })

            spotifyApi.setAccessToken(token_refresh.access_token)
            console.log("SE REFRESCO EL TOKEN", token_refresh.access_token)

            db.collection("TOKEN_AUTH").doc("token").update({ access_token: spotifyApi.getAccessToken() })
            console.log("SE ALMACENO EL TOKEN")
        })
    })

})