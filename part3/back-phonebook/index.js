require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const app = express();
const Person = require('./models/person');

const reqLogger = morgan((tokens, req, res) => [
  tokens.method(req, res),
  tokens.url(req, res),
  tokens.status(req, res),
  tokens.res(req, res, 'content-length'), '-',
  tokens['response-time'](req, res), 'ms',
  JSON.stringify(req.body),
].join(' '));

app.use(express.json());
app.use(express.static('dist'));
app.use(reqLogger);

app.get('/info', (request, response) => {
  const now = (new Date()).toString();
  Person.find({}).then((result) => {
    response.send(`<p>Phone book has info for ${result.length} people</p><p>${now}</p>`);
  });
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then((result) => response.json(result));
});

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then((person) => {
    if (!person) {
      response.status(404).json({
        error: 'No info',
      });
    } else {
      response.json(person);
    }
  });
});

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id).then(() => {
    response.status(204).end();
  });
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;
  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then((result) => {
      console.log(result);
      response.json(result);
    }).catch((err) => {
      console.log(err.name);
      next(err);
    });
});

app.post('/api/persons', (request, response, next) => {
  const { body } = request;
  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({
      error: 'Name or number missing need both',
    });
  }

  Person.find({ name: { $regex: new RegExp(`^${body.name}$`, 'i') } })
    .then((result) => {
      if (result.length > 0) {
        return response.status(400).json({
          error: 'Name must be unique',
        });
      }
      const person = new Person({
        name: String(body.name),
        number: String(body.number),
      });

      person.save().then((savedPerson) => {
        response.json(savedPerson);
      })
        .catch((err) => {
          next(err);
        });
    });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Bad request' });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' });
  } if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
