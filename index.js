require('dotenv').config()
const express = require('express');
const app = express()
const cors = require('cors')
const Note = require('./models/note');

// Loads the react build in the root!
app.use(express.static('build'))
// Middleware -- Allows use of cross origin AJAX-requests, important to use early, before the HTTP-requests
app.use(cors())
// Middleware -- Lets us get the body of requests as JS-objects
app.use(express.json())
// Creates middleware for logging every requests
const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path', req.path)
  console.log('Body', req.body)
  console.log('----')
  next()
}
// Middleware -- Logging!!
app.use(requestLogger)
// --------------  Defining routes
// Get all notes
app.get('/api/notes', (req, res, next) => {
    Note.find({}).then(note => {
      res.json(note)
    }).catch(err => {
      next(err)
    })
})
// Get specific note
app.get('/api/notes/:id', (req, res, next) => {
    Note.findById(req.params.id).then(note => {
      if (note) {
        res.json(note)
      } else {
        res.status(404).send({error: 'cannot find id'})
      }
    })
    .catch(err => {
      next(err)   // If err, then the error-handler will take over
    })
    
})
// Add a note to the database
app.post('/api/notes', (req, res, next) => {
    const body = req.body

    const note = new Note({
      content: body.content,
      important: body.important || false,
      date: new Date(),
    })

    note.save().then(savedNote => {
      res.json(savedNote)
    })
    .catch(err => next(err))
})
// Delete a note from the server
app.delete('/api/notes/:id', (req, res) => {
    Note.findByIdAndRemove(req.params.id)
      .then(result => {
        res.status(204).end()
      })
      .catch(err => next(err)) // If err, then the error-handler will take over
    
})
// Update a selected note in the server
app.put('/api/notes/:id', (req, res, next) => {
  const body = req.body // Gets entire body as JS-object, thanks to middleware
  const note = {        // Creates object to be added
    content: body.content,
    important: body.important
  }
  Note.findByIdAndUpdate(req.params.id, note, {new:true})
    .then(upatedNote => {
      res.json(upatedNote)
    })
    .catch(err => next(err)) // If err, then the error-handler will take over
})

// Creates middleware for unknown endpoints, everything that is not root or HTTP-requests
const unknownEndpoint = (req, res) => {
  res.status(404).send(`<h1>Error: 404. Unknown site</h1>`)
}
// Middelware -- For unknown endpoints
app.use(unknownEndpoint)
// Create middleware -- For error-handling
const errorHandler = (err, req, res, next) => {
  console.error(err.message)
  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (err.name == 'ValidationError') {
    return res.status(400).json({error: err.message})
  }

  next(err)
}
// Middleware -- run error-handling
app.use(errorHandler)
// Add Port
const PORT = process.env.PORT || 3001
// Run server!!
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})