const mongoose = require('mongoose')

if(process.argv.length<3) {
  console.log('Give password as an argument')
  console.log("Wrong usage\nUsage:\nnode mongo.js <password> - (to display contacts in phonebook)\nOR\nnode mongo.js <password> <name> <number> - (to add to phonebook)");
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://bajrasushant:${password}@cluster0.dletfe6.mongodb.net/phoneBook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if(process.argv.length === 3) {
  console.log("phonebook:")
  Person.find({}).then(result => {
    result.forEach(person => {
    console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}

else if(process.argv.length === 5) {
  const inputPerson = {
  "name": String(process.argv[3]),
  "number": String(process.argv[4]),
  }

  const person = new Person(inputPerson)
  person.save().then(() => {
    console.log(`added ${inputPerson.name} number ${inputPerson.number} to phonebook!`)
    mongoose.connection.close()
    });
}else{
  console.log("Wrong usage\nUsage:\nnode mongo.js <password> - (to display contacts in phonebook)\nOR\nnode mongo.js <password> <name> <number> - (to add to phonebook)");
  process.exit(1);
}

// const data = [
//     { 
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]
//
// let savedPersons = 0;
//
// const saveContacts = async () => {
//   for(const item of data) {
//   const person = new Person(item);
//   await person.save()
//   savedPersons++
//   }
//   if(savedPersons === data.length) {
//     mongoose.connection.close();
//     }
// }
//
// saveContacts();
