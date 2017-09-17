var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  dateCreated: String
})

var User = module.exports = mongoose.model('User', userSchema)

module.exports.getUserById = (id, callback) => {
  User.findById(id, callback)
}

module.exports.getUserByUsername = (username, callback) => {
  var query = {username: username}
  User.findOne(query, callback)
}

const saltRounds = 10
module.exports.createUser = (newUser, callback) => {
  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) {
      console.log(err)
    } else {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          console.log(err)
        } else {
          newUser.password = hash
          newUser.save(callback)
        }
      })
    }
  })
}

module.exports.comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) { throw err }
    callback(null, isMatch)
  })
}
