import * as admin from 'firebase-admin'


admin.initializeApp({
  credential: admin.credential.cert('./permission.json'),
  databaseURL: 'https://hoabar-c7876-default-rtdb.firebaseio.com',
  storageBucket: "gs://hoabar-c7876.appspot.com" //update this

})
const db = admin.firestore()


export { admin, db }