
import { Response } from 'express'
import { db } from '../config/firebase'
import { spotifyApi } from '../config/spotify'

type EntryType = {
    canciones: [],
    texto: any,
}
type Request = {
    body: EntryType,
    params: {}
}
function almacenarCanciones(req: Request, res: Response) {

    try {
        //        let { canciones } = req.body

        return res.status(200).send({
            status: 'success',
            message: "Se envio url de inicio de sesión",
            data: spotifyApi.getTemporaryAuthorizationUrl(),
            success: true
        })
    }
    catch (error: any) {
        return res.status(500).json(error.message)

    }

}
function buscarCancion(req: Request, res: Response) {

    let { texto } = req.body
    let cancionesArray: any[] = []
    db.collection("TOKEN_AUTH").doc("token").get().then((x:any)=>{
      spotifyApi.setAccessToken(x.data().access_token)  
      let promise = new Promise((resolve) => {
        spotifyApi.search.searchTracks(texto, { limit: 10, market: 'ES' }).then(canciones => {

            canciones.items.forEach(x => {
                let cancion = {
                    artistas: x.artists,
                    imagen: x.album.images[0].url,
                    nombre: x.name,
                    uri: x.uri,
                    popularidad: x.popularity,
                    duracion: x.duration_ms,
                    id: x.id
                }
                cancionesArray.push(cancion)
            })
            setTimeout(() => resolve(cancionesArray), 2500);

        }).catch(error => {
            
            
            return res.status(500).json(error)

        })

    })
    Promise.all([promise]).then(x => {
        return res.status(200).send({
            status: 'success',
            message: "Se encontraron canciones",
            data: cancionesArray,
            success: true
        })
    })
    })

    

  







}

function guardarCancion(req: Request, res: Response) {
    let canciones: any[] = req.body.canciones
    try {
        canciones.forEach(cancionElegida => {
            db.collection("bar").doc("hoa").collection("canciones").doc(cancionElegida.id).get()

                .then(cancion => {

                    if (cancion.exists || cancion === undefined) {

                        let listaUsuarios = cancion.get("usuarios")
                        let dataCancion: any = cancion.data()
                        let cont = Number(dataCancion.contador);
                        dataCancion.contador = cont + 1;
                        listaUsuarios.push(cancionElegida.usuario)
                        dataCancion.usuarios = listaUsuarios
                        db.collection("bar").doc("hoa").collection("canciones").doc(cancion.id).set(dataCancion)

                    } else {
                        let listaUsuarios = []
                        listaUsuarios.push(cancionElegida.userId)
                        let cont = Number(1);
                        cancionElegida.contador = cont
                        cancionElegida.usuarios = listaUsuarios
                        let fecha = new Date()
                        cancionElegida.creacion = fecha.getTime()

                        db.collection("bar").doc("hoa").collection("canciones").doc(cancion.id).set(cancionElegida)

                    }
                })

        })
        return res.status(200).send({
            status: 'success',
            message: "Se almacenaron las canciones",
            data: canciones,
            success: true
        })
    } catch (error) {
        return res.status(200).json("respuesta")

    }

    return 0


}

function obtenerHistorico(req: Request, res: Response) {
    let historicoArray: any[] = []
    db.collection("bar").doc("hoa").collection("historico").orderBy("fecha", 'desc').limit(10).get().then(canciones => {
        canciones.forEach(cancion => {
            historicoArray.push(cancion.data())
        })

    }).then(x => {
        return res.status(200).send({
            status: 'success',
            message: "Se encontraron canciones",
            data: historicoArray,
            success: true
        })
    }).catch(error => {
        return res.status(200).json("respuesta")

    })

}


export { almacenarCanciones, buscarCancion, guardarCancion, obtenerHistorico }