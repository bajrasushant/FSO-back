const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('Connecting to:', url)

mongoose.connect(url)
.then(result => {
  console.log('Connected to mongoDB')
  })
.catch((err) => {
  console.log('Connection failed', err.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number:{
    type:String,
    minLength: [8, 'Numbers should have at least the length of 8'],
    required: [true, 'User phone number required'],
    validate: {
      validator: function(v) {
        const [first, second] = v.split('-')
        if ((first.length === 2 && second.length >= 6) || (first.length === 3 && second.length >=5)) {
          return true;
        }
        return false;
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  }
})

personSchema.set('toJSON', {
transform: (document, returnedObject) => {
  returnedObject.id = returnedObject._id.toString()
  delete returnedObject._id
  delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema);
