const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const firebaseConfig = {
  apiKey: "AIzaSyC0ZRR66PK_uIg8kR31F8sHzIt7M8otvNQ",
  authDomain: "react-social-b1135.firebaseapp.com",
  databaseURL: "https://react-social-b1135.firebaseio.com",
  projectId: "react-social-b1135",
  storageBucket: "react-social-b1135.appspot.com",
  messagingSenderId: "200471444835",
  appId: "1:200471444835:web:2e86ef249fae3de2cd2756",
  measurementId: "G-DL8ZMP6ES5"
};

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);
const db = admin.firestore()


app.get('/screams', (request, response) => {
  let screams = []
  db
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      data.forEach(doc => screams.push({
        screamId: doc.id,
        body: doc.data().body,
        userHandle: doc.data().userHandle,
        createdAt: doc.data().createdAt
      }))
      return response.json(screams)
    })
    .catch(err => console.log(err))
});


app.post('/scream', (request, response) => {
  
  if (request.method !== 'POST') {
    return response.status(400).json({error: 'Method is not allowed'})
  }

  const newScream = {
    body: request.body.body,
    userHandle: request.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  } 

  db
    .collection('screams')
    .add(newScream)
    .then(doc => response.json(`Document ${doc.id} created successfully`))
    .catch(err => response.status(500).json({error: 'Something went wrong'}))
});


app.post('/signup', (request, response) => {

  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    handle: request.body.handle,
  }

  let token, userId;

  db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
      if (doc.exists) {
        return response.status(400).json({handle: 'this handle is already taken'})
      } else {
        return  firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      userId = data.user.uid
      return data.user.getIdToken()
    })
    .then(idToken => {
      token = idToken
      const userCredentials= {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      }
      return db.doc(`/users/${userCredentials.handle}`).set(userCredentials)
    })
    .then(() => {
      return response.status(201).json({ token }); 
    })
    .catch(err => {
      console.log(err)
      if (err.code === "auth/email-already-in-use") {
        return response.status(400).json({ email: 'This email is already used'})
      }
      return response.status(500).json({error: err.code})
    })
});


exports.api = functions.region('europe-west1').https.onRequest(app);