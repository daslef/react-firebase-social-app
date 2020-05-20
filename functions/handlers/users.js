const { db, admin } = require('../util/admin')
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
    
    const noImg = 'default-user-image-png-7.png'
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
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
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
  
    const { valid, errors } = validateLogin(user)
    if (!valid) return response.status(400).json(errors)

  
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then(data => data.user.getIdToken())
      .then(token => response.json({token}))
      .catch(err => {
        console.log(err)
        return response.status(500).json({ error: err.code })
    })
}

exports.uploadImage = (request, response) => {
    const BusBoy = require('busboy')
    const path = require('path')
    const os = require('os')
    const fs = require('fs')

    const busboy = new BusBoy({ headers: request.headers })
    let imageFilename
    let imageToBeUploaded = {}

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        const extension = filename.split('.').pop()
        imageFilename = `${Math.round(Math.random() * 100000000)}.${extension}`
        const filepath = path.join(os.tmpdir(), imageFilename)
        imageToBeUploaded = { filepath, mimetype }
        file.pipe(fs.createWriteStream(filepath))
    })

    busboy.on('finish', () => {
        admin.storage().bucket().upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
        .then(() => {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFilename}?alt=media`
            return db.doc(`/users/${request.user.handle}`).update({ imageUrl })
        })
        .then(() => {
            return response.json({ message: 'Image uploaded successfully' })
        })
        .catch(err => {
            console.error(err)
            return response.status(500).json({ error: err.code })
        })
    })

    busboy.end(request.rawBody)
}