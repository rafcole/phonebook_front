import { useState, useEffect } from 'react'
import axios from 'axios'
import personService from './services/persons.js'

const DeleteButton = ({person, handleClick}) => {
  return (
     <>
       <button onClick={handleClick}>
         delete
       </button>
     </>
  )
 }

const Person = ({person, handleDelete}) => {
  return (
    <>
      <li key={person.id}>{person.name} - {person.number} - <DeleteButton person={person} handleClick={handleDelete}></DeleteButton></li>
    </>
  )
}

const Filter = ({text, onChange}) => {
  return (
    <div>
    {text} <input onChange={onChange}/>
    </div>
  )
}
const PersonForm = (props) => {
  // console.log('personform props', props)
  return (
    <form onSubmit={props.onSubmit}>
      <div>
        name: <input value={props.nameValue} onChange={props.nameChange}/>
      </div>
      <div>number: <input value={props.phoneValue} onChange={props.phoneChange}/></div>
      <div>
        <button type="submit" >add</button>
      </div>
    </form>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])

  const generateId = () => {
    return persons.length > 0 ? persons[persons.length - 1].id : 1
  }

  const [personsToShow, setPersonsToShow] = useState(persons);

  const [newName, setNewName] = useState('')
  const [nameInputValue, setnameInputValue] = useState('')
  const [phoneInputValue, setPhoneInputValue] = useState('')
  // const [currentId, setCurrentId] = useState(generateId);

  // load initial
  useEffect(() => {
    console.log('effect')

    personService
      .getAll()
      .then(personsArr => {
        setPersons(personsArr);
        setPersonsToShow(personsArr);
        // setCurrentId(personsArr.length)
      })

  }, [])

  const deleteEntry = (person) => {
    return () => {
      if (window.confirm(`Delete ${person.name} from phonebook?`)) {
        personService
          .removeEntry(person.id)
          .then(_yeeted => {
            let withoutPerson = persons.filter((entry) => entry.id !== person.id)
            setPersons(withoutPerson);
            let showWithoutPerson = personsToShow.filter((entry) => entry.id !== person.id)
            setPersonsToShow(showWithoutPerson);
          })
      }
     }
  }


  const lowerCasePersons = () => {
    return persons.map(person => person.name.toLowerCase());
  }

  const currentNameBlank = () => {
    return newName.trim() === ''
  }

  const handleNameChange = (e) => {
    let currentInput = e.currentTarget.value
    setnameInputValue(currentInput);
    setNewName(currentInput)
  }

  const handleNumberChange = (e) => {
    let currentNumber = e.currentTarget.value;
    // console.log('current number input', currentNumber)
    setPhoneInputValue(currentNumber);
  }

  const currentNameExists = () => {
    let currentNames = lowerCasePersons();
    console.log('newName', newName)
    let matchIdx = currentNames.indexOf(newName.toLowerCase());

    if (matchIdx !== -1) {
      console.log('found a match', persons[matchIdx])
      return persons[matchIdx].id;
    } else {
      return false
    }
  }

  const handleSubmitName = (e) => {
    e.preventDefault();
    let id = currentNameExists()

    if (id) {
      if (window.confirm(`${newName} is already in the phonebook, update their number?`)) {
        let updated = { name: nameInputValue, number: phoneInputValue }
        personService
          .update(id, updated)
          .then(freshEntry => {
            console.log('freshEntery', freshEntry);
            let removeLast = persons.filter(person => person.id !== id).concat(freshEntry);
            console.log('removeLast', removeLast)
            setPersons(removeLast);
            setPersonsToShow(removeLast);
            console.log('updated persons successfully')
          })
        return;
      } else {
        return
      }
    } else if (currentNameBlank()) {
      alert(`Name cannot be blank`) 
      return;
    }
    console.log('new person input is valid')
    let newPerson = {name: newName, number: phoneInputValue}

    // let localId = currentId + 1;
    personService
      .create(newPerson)
      .then(data => {
        console.log('data from response to handleSubmitName', data)
        // data.id = localId;
        let newPersonsList = persons.concat(data).sort(sortByName)
        setPersons(newPersonsList)
        // setCurrentId(localId);
        setPersonsToShow(newPersonsList)
        console.log('new person added successfully')
      })
    // axios
    //   .post('http://localhost:3001/notes', noteObject)
    //   .then(response => {
    //     console.log(response)
    //   })
  
  }

  const handleFilterChange = (e) => {
    let currentFilter = e.currentTarget.value.toLowerCase();

    if (currentFilter.trim() === '') {
      setPersonsToShow(persons);
    }

    console.log('currentFilter', currentFilter)

    let lowerCaseNames = lowerCasePersons();
    
    setPersonsToShow(persons.filter(entry => entry.name.toLowerCase().includes(currentFilter)))
  }

  const sortByName = (a, b) => (a.name - b.name)


  console.log('rendering... persons.length ===', persons.length)
  console.log('======= personsToShow', personsToShow)
  return (
    <div>
      <h1>Phonebook</h1>

      <Filter text="Filter input" onChange={handleFilterChange} />

      <h3>Add New</h3>
      <PersonForm 
        onSubmit={handleSubmitName}
        nameValue={nameInputValue}
        nameChange={handleNameChange}
        phoneValue={phoneInputValue}
        phoneChange={handleNumberChange}
        />
      {/* <form onSubmit={handleSubmitName}>
        <div>
          name: <input value={nameInputValue} onChange={handleNameChange}/>
        </div>
        <div>number: <input value={phoneInputValue} onChange={handleNumberChange}/></div>
        <div>
          <button type="submit" >add</button>
        </div>
      </form> */}
      <h2>Numbers</h2>
      <ul>
        {personsToShow.map(person => <Person key={person.id} person={person} handleDelete={deleteEntry(person)}/>)}
      </ul>
    </div>
  )
}

export default App