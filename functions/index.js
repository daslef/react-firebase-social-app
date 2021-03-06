const functions = require('firebase-functions');
const app = require('express')();

const FBAuth = require('./util/fbAuth')

const { 
  getAllScreams, 
  postOneScream,
  getScream 
} = require('./handlers/screams');

const { 
  signup, 
  login, 
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require('./handlers/users');


app.post('/scream', FBAuth, postOneScream);
app.get('/screams', getAllScreams);
app.get('/scream/:screamId', getScream)

app.post('/signup', signup);
app.post('/login', login);

app.get('/user', FBAuth, getAuthenticatedUser)
app.post('/user', FBAuth, addUserDetails)
app.post('/user/image', FBAuth, uploadImage)

exports.api = functions.region('europe-west1').https.onRequest(app);