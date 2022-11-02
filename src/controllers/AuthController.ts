
import { Response } from 'express'
import { spotifyApi } from '../config/spotify'
import { SpotifyWebApi } from 'spotify-web-api-ts/types'
import { obtenerInfoReproductor } from './AdminController'
//import { obtenerInfoReproductor } from './AdminController'
import { db } from '../config/firebase'

type EntryType = {
    token: any
}

type Request = {
    body: EntryType,
    params: {}
}
let spotifyVAL: SpotifyWebApi

export let encendido = false
function iniciarSesion(req: Request, res: Response) {
    console.log("inicio sesion el admin")
    try {
       
        return res.status(200).send({
            status: 'success',
            message: "Se envio url de inicio de sesión",
            data: spotifyApi.getRefreshableAuthorizationUrl({ scope: ['ugc-image-upload', 'user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing', 'streaming', 'app-remote-control', 'user-read-email', 'user-read-private', 'playlist-read-collaborative', 'playlist-modify-public', 'playlist-read-private', 'playlist-modify-private', 'user-library-modify', 'user-library-read', 'user-top-read', 'user-read-playback-position', 'user-read-recently-played', 'user-follow-read', 'user-follow-modify'] }),
            success: true
        })
    }
    catch (error: any) {
        return res.status(500).json(error.message)

    }

}

function RefrescarToken(req: Request, res: Response) {
   /* spotifyApi.getRefreshableUserTokens(spotifyApi.getAccessToken()).then(code => {
        spotifyApi.setAccessToken(code.access_token);
        console.log("TOKEN REFRESCADO",spotifyApi.getAccessToken())
        return res.status(200).send({
            status: 'success',
            message: "Se guardo el token exitosamente",
            data: spotifyApi,
            success: true
        })
    }).catch(error=>{
        return res.status(500).json(error)

    })*/
   
    spotifyApi.getRefreshedAccessToken(spotifyApi.getAccessToken()).then(code => {
        spotifyApi.setAccessToken(code.access_token);
        console.log("TOKEN REFRESCADO",spotifyApi.getAccessToken())
        return res.status(200).send({
            status: 'success',
            message: "Se guardo el token exitosamente",
            data: code,
            success: true
        })
    }).catch(error=>{
        return res.status(500).json(error)

    })
}


function obtenerToken(req: Request, res: Response) {
    let { token } = req.body
    spotifyApi.setAccessToken(token)


    spotifyVAL=spotifyApi
        encendido = true
        obtenerInfoReproductor()
    spotifyApi.getRefreshableUserTokens(spotifyApi.getAccessToken()).then(code => {
        spotifyApi.setAccessToken(code.access_token);
        
        db.collection("TOKEN_AUTH").doc("token").set({access_token:spotifyApi.getAccessToken(),refresh_token:code.refresh_token})
       // obtenerInfoReproductor()
    })

    try {

        return res.status(200).send({
            status: 'success',
            message: "Se guardo el token exitosamente",
            data: spotifyApi,
            success: true
        })
    }
    catch (error: any) {
        return res.status(500).json(error.message)
    }

}

export function obtenervalSpotify(){
    return spotifyVAL
}


export { iniciarSesion, obtenerToken,RefrescarToken }