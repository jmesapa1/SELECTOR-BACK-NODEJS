import { SpotifyWebApi } from 'spotify-web-api-ts';
// credentials are optional

let spotifyApi = new SpotifyWebApi({
  clientId: '92e5179facae4389aaeac27f951d7b16',
  clientSecret: '9e0d61e0f94d40338f64348efca46131',
 // redirectUri: 'https://dnki4alfxi8uz.cloudfront.net/token'
   redirectUri: 'https://hoabar-c7876.firebaseapp.com/token'

});





export { spotifyApi }