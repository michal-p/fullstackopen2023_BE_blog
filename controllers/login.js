const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const createToken = require('../utils/functions').createToken

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })

  // Because the passwords themselves are not saved to the database, but hashes calculated from the passwords,
  // the bcrypt.compare method is used to check if the password is correct:
  const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const token = createToken(user)

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter