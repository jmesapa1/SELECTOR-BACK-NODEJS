
import { Response } from 'express'
import { db } from '../config/firebase'
import { spotifyApi } from '../config/spotify'

type EntryType = {
    canciones: [],
    texto: any,
    cancion: any,
    id: any
}

type Request = {
    body: EntryType,
    params: {}
}
function eliminarCancionElegida(req: Request, res: Response) {
    let { id } = req.body

    db.collection("bar").doc("hoa").collection("canciones").doc(id).delete();

    try {
        //        let { canciones } = req.body

        return res.status(200).send({
            status: 'success',
            message: "Se elimino la canción correctamente",
            data: {},
            success: true
        })
    }
    catch (error: any) {
        return res.status(500).json(error.message)

    }

}

function encolarCanciones(req: Request, res: Response) {
    let { canciones } = req.body
    canciones.forEach((cancion: any) => {
        spotifyApi.player.addToQueue(cancion.uri).then(x => {
            db.collection("bar").doc("hoa").collection("canciones").doc(cancion.id).delete();
            adicionarCancionHistorico(cancion)
            agregarPlayListHisotrico(cancion.uri)
            return res.status(200).send({
                status: 'success',
                message: "Se añadio la canción correctamente",
                data: {},
                success: true
            })
        }).catch(error => {
            console.log("error", error)
        })
    })

}


async function obtenerInfoReproductor() {
    try {
        setInterval((x: any) => {
            db.collection("TOKEN_AUTH").doc("token").get().then((x:any)=>{
                spotifyApi.setAccessToken(x.data().access_token)  
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
                return "Se acabo"
            }).catch(error => {
                console.log(error)
                return error

            })
        })
        }, 60000)
    } catch (error) {
        console.log("ERROR->", error)
    }

}





export function adicionarCancionHistorico(cancion: any) {
    let fecha = new Date()
    cancion.fecha = fecha.getTime()
    db.collection("bar").doc("hoa").collection("historico").add(cancion);

}
function agregarPlayListHisotrico(cancion: string) {
    spotifyApi.playlists.getPlaylistItems('18R03zzkCe2ZZKDX7Dhj18').then(canciones => {
        if (canciones.items.filter(x => x.track.uri === cancion).length ===0 ) {
            spotifyApi.playlists.addItemToPlaylist('18R03zzkCe2ZZKDX7Dhj18', cancion).then(x => {

            })
        }
    })

}


export { eliminarCancionElegida, encolarCanciones, obtenerInfoReproductor }