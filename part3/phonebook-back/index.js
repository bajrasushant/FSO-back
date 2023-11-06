const express = require('express')
const morgan = require('morgan')

const app = express()

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

let data = [
    { 
      "id": 1, "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
  const now = (new Date()).toString()
  response.send(`<p>Phone book has info for ${data.length} people</p><p>${now}</p>`)
  })

app.get('/api/persons', (request, response) => {
  response.json(data)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = data.find(person => person.id === id)
  if(!person) {
    response.status(404).json({
    error: 'No info'
    })
  }else{
    response.json(person)
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = data.filter(person => person.id !== id)
  data = person 
  response.json(person)
})

const generateId = () => {
  const uniqueId = Math.floor(Math.random() * Date.now())
  const found = data.some(person => person.id === uniqueId)
  if(!found) return uniqueId
  else return generateId()
}

app.put('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const body = request.body
  const person = data.find(person => person.id === id)
  person.number = body.number
  response.json(person)
 }
)

app.post('/api/persons', (request, response) => {
  const body = request.body
  if(!body.name || !body.number) {
    return response.status(400).json({
    error: 'Name or number missing need both'
    })
  }

  if(data.some(person => person.name.toLowerCase() === body.name.toLowerCase())) {
    return response.status(400).json({
    error: "Name must be unique"
    })
  }

  const contact = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  data = data.concat(contact)
  response.json(contact)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  }
)

