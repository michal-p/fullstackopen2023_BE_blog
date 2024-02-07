const supertest = require('supertest')
const mongoose = require('mongoose')

const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

afterAll(async () => {
  await mongoose.connection.close()
})

test('notes are returned as json', async () => {
  console.log('entered test')
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all notes are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('test_unique_identifier_property', async () => {
  const response = await api.get('/api/blogs/')

  expect(response.body[0].id).toBeDefined()
})

test('create a new blog post with all fields filled', async () => {
  const newBlogPost = {
    title: 'New Blog Post',
    author: 'John Doe',
    url: 'http://www.example.com',
    likes: 10
  }

  await api.post('/api/blogs')
    .send(newBlogPost)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const lastBlogPostInDB = blogsAtEnd[blogsAtEnd.length - 1]
  expect(lastBlogPostInDB).toMatchObject(newBlogPost)
})

test('should test default likes value', async () => {
  const newBlogPost = {
    title: 'Aaaaaa',
    author: 'Edsgerrrrrr WWWWW. Dijkstraaaaa',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html'
  }

  await api.post('/api/blogs/')
    .send(newBlogPost)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const lastBlogPostInDB = blogsAtEnd[blogsAtEnd.length - 1]
  expect(lastBlogPostInDB.likes).toBe(0)
})

test('test_create_blog_missing_properties', async () => {
  const newBlogPost = {
    author: 'John Doe',
    likes: 10
  }

  await api.post('/api/blogs')
    .send(newBlogPost)
    .expect(400)
})