const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
let db = admin.firestore();

const express = require('express');
const app = express();


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


exports.api = functions.region('europe-west1').https.onRequest(app);