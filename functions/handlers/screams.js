const { db } = require('../util/admin')

exports.getAllScreams = (request, response) => {
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
}

exports.postOneScream = (request, response) => {
    if (request.body.body.trim() === '') {
      return response.status(400).json({ body: 'Body must not be empty' });
    }
  
    const newScream = {
      body: request.body.body,
      userHandle: request.user.handle,
      createdAt: new Date().toISOString()
    };
  
    db.collection('screams')
      .add(newScream)
      .then((doc) => {
        response.json({ message: `document ${doc.id} created successfully` });
      })
      .catch((err) => {
        response.status(500).json({ error: 'something went wrong' });
        console.error(err);
      });
}

exports.getScream = (request, response) => {
  let screamData = {}
  db.doc(`/screams/${request.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return response.status(404).json({error:  'Scream not found'})
      }
      screamData = doc.data()
      screamData.screamId = doc.id
      return db.collection('comments')
                .orderBy('createdAt', 'desc')
                .where('screamId', '==', request.params.screamId)
                .get()
    })
    .then(data => {
      screamData.comments = []
      data.forEach(comment => screamData.comments.push(comment.data()))
      return response.json(screamData)
    })
    .catch(err => {
      console.log(err)
      response.status(500).json({ error: err.code })
    })
}