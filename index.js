const express = require('express')
const app = express()
app.use(express.json())

var morgan = require('morgan')
morgan.token('entry', function getEntry (req) {
  console.log('entry', req.body)
  return JSON.stringify(req.body);
})

// status is pulled from response so this runs after req/response is complete
app.use(morgan(':method :url :status :entry'))



const generateId = () => {
  return Math.floor(Math.random() * 10000);
}



let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
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
    "name": "Mary Poppenthisdieck", 
    "number": "39-23-6423122"
  }
]
app.get('/info', (request, response) => {
  let peopleData = `The phonebook has ${String(persons.length)} entries`
  let newlines = '\n\n'
  let date = new Date()
  // response.body(`<p>${peopleData}${newlines}${date}</p>`)
  response.send(`<p>${peopleData}</p><br><p>${date}</p>`)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

const getPersonById = (id) => {
  console.log('wrong route')
  return persons.find(person => person.id === id)
}

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)

  // response.send(`Please set up rout for persons/${id}`)
  // go get person with id

  let person = getPersonById(id)

  if (person) {
    console.log(person);
    response.json(person)
  } else {
    response.status(404).end()
  }

})

const validate = (name, number) => {
  let result = { isValid: true };

  if (name.trim() === '') {
    result.isValid = false;
    result.errorMessage = 'Name cannot be blank';
    return result
  } 
  for (let person of persons) {
    if (person.name === name) {
      result.isValid = false;
      result.errorMessage = "This name is already in the phonebook"
      break;
    }
    if (person.number === number) {
      result.isValid = false;
      result.errorMessage = "This number is already in the phonebook"
      break;
    }
  }

  return result;

}

app.post('/api/persons', (request, response) => {
  // interrogate request
  // response.send('here I will invent a new person for you')
  // required anywhere we receive data

  // console.log(morgan('tiny'))

  if (!request.body.name) {
    return response.status(400).json({ 
      error: 'Name required' 
    })
  } else if (!request.body.number) {
    return response.status(400).json({ 
      error: 'number required' 
    })
  }

  console.log(request.body);

  const person = request.body

  let isValid = validate(person.name, person.number)

  if (isValid.isValid) {
    person.id = generateId();

    persons.push(person);

    console.log(person)
    return response.json(person)
  } else {
    return response.status(400).json({
      error: isValid.errorMessage
    })
  }

})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  response.send(`delete person id ${id}`)

  let idx = persons.indexOf(person => person.id === id)

  persons.splice(idx, 1);
 
  response.status(204).end()
})

// put for swap?

// patch for partial update?

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
