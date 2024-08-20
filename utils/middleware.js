const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.stack) //! this log problem for developer on server console

  //! this part is shown to user of our website
  switch (error.name) {
    case 'CastError':
      return response.status(400).send({ error: 'malformatted id' })
    case 'ValidationError':
      return response.status(400).json({ error: error.message })
    case 'MongoServerError':
      if (error.message.includes('E11000 duplicate key error')) {
        return response.status(400).json({ error: 'expected `username` to be unique' })
      }
      break
    case 'StrictPopulateError':
      return response.status(500).json({ error: 'Internal server error.' })
    case 'JsonWebTokenError':
      return response.status(401).json({ error: 'token invalid' })
    case 'TokenExpiredError':
      return response.status(401).json({ error: 'token expired' })
    default:
      next(error)
  }

}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  const bearer = 'Bearer '
  if (authorization && authorization.startsWith(bearer)) {
    request.token = authorization.replace(bearer, '')
  }

  next()
}

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)//* Because 'tokenExtractor' middleware is called in every request, then we can access request.token
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)
  request.user = user

  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}