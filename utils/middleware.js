const logger = require('./logger')

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
    default:
      next(error)
  }

}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}