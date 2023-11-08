require('dotenv').config()
const express = require('express')
const morgan = require('morgan')

const app = express()
const Person = require('./models/person');

const reqLogger = morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body),
    ].join(' ')
  })

app.use(express.json())
app.use(express.static('dist'))
app.use(reqLogger)

app.get('/info', (request, response) => {
  const now = (new Date()).toString()
  Person.find({}).then(result => {
  response.send(`<p>Phone book has info for ${result.length} people</p><p>${now}</p>`)
  })
  })

app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => response.json(result)
  )
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person=> {
  if(!person) {
    response.status(404).json({
    error: 'No info'
    })
  }else{
    response.json(person)
  }
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id).then(result => {
  response.status(204).end()
  })
})


app.put('/api/persons/:id', (request, response) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number
    }
  Person.findByIdAndUpdate(request.params.id, person, { new:true }).then(result => {
  console.log(result)
  response.json(result)
  }).catch(err=>next(err))
 }
)

app.post('/api/persons', (request, response) => {
  const body = request.body
  if(body.name === undefined || body.number === undefined) {
    return response.status(400).json({
      error: 'Name or number missing need both'
    })
  }

  Person.find({name: { $regex: new RegExp(body.name, 'i')}})
    .then((result) => {
      if(result.length > 0) {
        return response.status(400).json({
          error: "Name must be unique"
        })
      } else {
        const person = new Person({
          name: String(body.name),
          number: String(body.number),
        })

        person.save().then(savedPerson => {
          response.json(savedPerson)
        })

      }
  })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  }
)

const unknownEndpoint = (request, response) => {
  response.status(404).send({error:'Bad request'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  
  if(error.name === 'CastError'){
    return response.status(400).send({ error: 'Malformatted id' })
  }
  next(error)
};

app.use(errorHandler)
