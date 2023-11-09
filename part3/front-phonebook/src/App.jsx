import { useState, useEffect } from 'react'
import './index.css'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'
import personService from './services/person'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filterPersons, setFilterPersons] = useState([])
  const [message, setMessage] = useState(null)
  const [status, setStatus] = useState('ok')

  useEffect(() => {
    personService.getAll().then(res => setPersons(res)).catch(() => fixMessage('Something occured connect internet and try again', 'error'));
  }, []);

  const handleFilterChange = (e) => {
    const search = e.target.value
    const filteredPersons = persons.filter(person => person.name.toLowerCase().includes(search.toLowerCase()))
    setFilterPersons(filteredPersons)
  }

  const handleNameChange = (e) => {
    setNewName(e.target.value)
  }

  const handleNumberChange = (e) => {
    setNewNumber(e.target.value)
  }

  const fixMessage = (mess, status) => {
    setMessage(mess);
    setStatus(status);
    setTimeout(() => {
      setMessage(null)
      }, 5000
      )
  }
  
  const addToPersons = (e) => {
    e.preventDefault()
    if(!checkForPrevEntry(newName)){
    const personObject = {
      name: newName,
      number: newNumber,
    }
      personService
        .create(personObject)
        .then(returnedPerson=> {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
          fixMessage(`Added ${personObject.name}`, 'ok')
        })
        .catch(err => {
          console.log(err.response.data.error)
          fixMessage(`${err.response.data.error}`, 'error')
        })
    } else {
      if(window.confirm(`${newName} is already in the phonebook, replace the old number with a new one?`)) {
        const indexToReplace = indexofName(newName);  
        const idOfPerson = persons[indexToReplace].id
        const updatedPersonObject = {...persons[indexToReplace], number: newNumber} 
        personService.update(idOfPerson, updatedPersonObject).then(updatedPerson => {
          fixMessage(`Updated ${persons[indexToReplace].name}`, 'ok')
          setPersons(persons.map(person => person.id !== idOfPerson ? person : updatedPerson))
        setNewName('');
        setNewNumber('');
        })
        .catch(err => {
          console.log(err.response.data.error)
          fixMessage(`${err.response.data.error}`, 'error')
          })
        } else {
        setNewNumber('')
        setNewName('')
      }
    }
  }

  const deleteContact = (id, personName) => {
    if(window.confirm(`Delete ${personName}?`)) {
      personService.deleteFromPhonebook(id)
      .catch(() => fixMessage(`Information of ${personName} has already been removed from the server`, 'error'))
      setPersons(persons.filter(person => person.id !== id))
    }
  }

  const indexofName = (name) => {
    return (persons.findIndex(person => person.name.toLowerCase() === name.toLowerCase()));
  }

  const checkForPrevEntry = (name) => {
    const regex = new RegExp(`^${name}$`, 'i')
    // console.log('same entry', persons.some(person=>person.name.toLowerCase() === name.toLowerCase()))
    return persons.some(person=> regex.test(person.name))
  }

  const personsToShow = filterPersons.length === 0
  ? persons
  : filterPersons

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} status={status} />
      <Filter onChange={handleFilterChange}/> 
      <h2>Add a new</h2>
      <PersonForm addToPersons={addToPersons} newName={newName} handleNameChange={handleNameChange} newNumber={newNumber} handleNumberChange={handleNumberChange} />
      <h2>Numbers</h2>
      <Persons personsToShow={personsToShow} deleteContact={deleteContact} />
    </div>
  )
}

export default App
