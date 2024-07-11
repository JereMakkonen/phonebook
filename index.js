require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
morgan.token('data', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : null
})

app.get('/info', (request, response) => {
  Person.countDocuments().then(n => {
    response.send(`<p>Phonebook has info for ${n} people<br />${Date()}</p>`)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find().then(person => { response.json(person) })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) response.json(person)
      else response.status(404).end()
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => { 
      if (!result) throw new Error('Person not found')
      response.status(204).end() 
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const person = new Person({
    name: request.body.name,
    number: request.body.number
  })
  person.save().then(person => { response.json(person) })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id, 
    { name, number },
    { new: true, runValidators: true, context: 'query' })
    .then(person => { 
      if (!person) throw new Error('Person not found')
      response.json(person) 
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.name)

  if (error.name === 'CastError')
    return response.status(400).json({ error: 'malformatted id' })
  if (error.name === 'ValidationError')
    return response.status(400).json({ error: error.message })
  if (error.message === 'Person not found')
    return response.status(404).json({ error: error.message })

  next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
