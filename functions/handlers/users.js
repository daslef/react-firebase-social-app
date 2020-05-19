const { db } = require('../util/admin')
const firebase = require('firebase')
const config = require('../util/config')

firebase.initializeApp(config)


const { validateSignup, validateLogin } = require('../util/validators')

exports.signup = (request, response) => {

    const newUser = {
      email: request.body.email,
      password: request.body.password,
      confirmPassword: request.body.confirmPassword,
      handle: request.body.handle,
    }
  
    const { valid, errors } = validateSignup(newUser)
    if (!valid) return response.status(400).json(errors)
    

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
}

exports.login = (request, response) => {

    const user = {
      email: request.body.email,
      password: request.body.password
    }
  
    const { valid, errors } = validateSignup(user)
    if (!valid) return response.status(400).json(errors)

  
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then(data => data.user.getIdToken())
      .then(token => response.json({token}))
      .catch(err => {
        console.log(err)
        return response.status(500).json({ error: err.code })
      })
  }