const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const isStrongPassword = require('../utils/functions').isStrongPassword

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body
  const validationResult = isStrongPassword(password)
  if (!validationResult.status) {
    return response.status(400).json({ error: validationResult.message })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  const user = new User({
    username,
    name,
    passwordHash,
  })
  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs')
  response.json(users)
})

module.exports = usersRouter