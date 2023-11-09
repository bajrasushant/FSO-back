const PersonForm = ({addToPersons, newName, handleNameChange, newNumber, handleNumberChange}) => {
  return (
    <form onSubmit={addToPersons}>
      <div>
        name: <input value={newName} onChange={handleNameChange} />
        <div>
          number: <input value={newNumber} onChange={handleNumberChange} /></div>
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>

  )
}

export default PersonForm;
