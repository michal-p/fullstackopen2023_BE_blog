const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const helper = require('./api_helper')

const User = require('../models/user')

describe('User api testing when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash(process.env.TEST_ROOT_USER_PASSWORD, 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: process.env.TEST_ROOT_USER_PASSWORD,
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: process.env.TEST_ROOT_USER_PASSWORD,
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('check if the username property is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'bu',
      password: process.env.TEST_ROOT_USER_PASSWORD,
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes(`\`username\` (\`${newUser.username}\`) is shorter than the minimum allowed length (3).`))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('check if the username property is too long', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'zmrzlina9012345678901',
      password: process.env.TEST_ROOT_USER_PASSWORD,
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes(`\`username\` (\`${newUser.username}\`) is longer than the maximum allowed length (20).`))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('check allowed characters in username property', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'bu$',
      password: process.env.TEST_ROOT_USER_PASSWORD,
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes(`\`username\` is invalid (${newUser.username}).`))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
  test('check if password is strong enough', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'bus',
      password: 'weakPassword',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('Password must be at least 3 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character'))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})