var express = require('express')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var router = express.Router()

var User = require('../models/user')

// GET users listing.
router.get('/', (req, res, next) => {
  res.send('respond with a resource')
})

router.post('/login', passport.authenticate('local'), (req, res, next) => {
  if (!req.user) { // user was not authenticated

  } else { // user is logged in
    res.send({message: 'Login successful.', user: req.user})
  }
})

router.post('/signup', (req, res) => {
  var username = req.body.username
  var email = req.body.email
  var password = req.body.password
  // var confirmPassword = req.body.confirmPassword

  console.log(req.body)
  req.checkBody('username', 'Username is required').notEmpty()
  req.checkBody('email', 'Email is required').notEmpty()
  req.checkBody('email', 'Email provided is not formatted correctly').isEmail()
  req.checkBody('password', 'Password is required').notEmpty()
  req.checkBody('confirmPassword', 'Passwords do not match').equals(password)

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      var errors = result.array().map((elem) => {
        return elem.msg
      })
      console.log('There are following validation errors: ' + errors.join('&&'))
      res.send({ errors: errors })
    } else {
      var newUser = new User({
        username: username,
        email: email,
        password: password
      })
      User.createUser(newUser, (err, user) => {
        if (err) {
          console.log(err)
          res.send(err)
        } else {
          console.log(user)
          res.send({message: 'User created!', user: user})
        }
      })
    }
  })
})

passport.use(new LocalStrategy(
  (username, password, done) => {
    User.getUserByUsername(username, (err, user) => {
      if (err) { // Error finding user
        console.log(err)
      }
      if (!user) { // User not found in db
        return done((null, false), {message: 'User not found'})
      } else { // User found in db (user exists / identified
        User.comparePassword(password, user.password, (err, auth) => { // check authenticity of user
          if (err) {
            console.log(err)
          }
          if (auth) {
            return done(null, user)
          } else {
            return done(null, false, {message: 'Username or password does not match!'})
          }
        })
      }
    })
  }
))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.getUserById(id, (err, user) => {
    done(err, user)
  })
})

module.exports = router
