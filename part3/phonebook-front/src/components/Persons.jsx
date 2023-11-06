const Persons = ({personsToShow, deleteContact}) => {
  return (
    personsToShow.map(person =><p key={person.id}>{person.name} {person.number}<span> <button onClick={()=>deleteContact(person.id, person.name)}>delete</button></span></p>
    )
  )}

export default Persons
