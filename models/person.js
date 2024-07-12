const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
const url = process.env.MONGODB_URL

mongoose.connect(url)
  .then(() => { console.log('connected to MongoDB') })
  .catch(error => { console.log('error connecting to MongoDB:', error.message) })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: num => /^\d{2,3}-\d+$/.test(num),
    required: true
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
