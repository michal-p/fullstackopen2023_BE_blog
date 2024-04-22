const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)

const helper = require('./blog_list_api_helper')

const Blog = require('../models/blog')
describe('When there is initially some notes saved', () => {

  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('content type of blogs are returned as json.', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('of count all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('of unique identifier property.', async () => {
    const response = await api.get('/api/blogs/')

    assert.ok(response.body[0].id, 'Expected id property to be defined.')
  })

  describe('View a specific blog', () => {

    test('succeeds with a valid id.', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const blogToView = blogsAtStart[0]

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.deepStrictEqual(resultBlog.body, blogToView)
    })

    test('fails with statuscode 404 if blog does not exist.', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api
        .get(`/api/blogs/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with statuscode 400, id is invalid.', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .get(`/api/blogs/${invalidId}`)
        .expect(400)
    })
  })

  describe('Create a new blog', () => {

    test('with all fields filled.', async () => {
      const newBlog = {
        title: 'New Blog Post',
        author: 'John Doe',
        url: 'http://www.example.com',
        likes: 10
      }

      const response = await api.post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const createdBlog = blogsAtEnd.find(blog => blog.id === response.body.id)
      assert.deepStrictEqual({ title: createdBlog.title, author: createdBlog.author, url: createdBlog.url, likes: createdBlog.likes }, newBlog)
    })

    test('without likes, expect default value.', async () => {
      const newBlog = {
        title: 'Aaaaaa',
        author: 'Edsgerrrrrr WWWWW. Dijkstraaaaa',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html'
      }

      await api.post('/api/blogs/')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const lastBlogInDB = blogsAtEnd[blogsAtEnd.length - 1]
      assert.ok('likes' in lastBlogInDB)
      assert.strictEqual(lastBlogInDB.likes, 0)
    })

    test('with missing properties title and url.', async () => {
      const newBlog = {
        author: 'John Doe',
        likes: 10
      }

      await api.post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('with missing property title.', async () => {
      const newBlog = {
        url: 'https://reactpatterns.com/',
        author: 'John Doe',
        likes: 10
      }

      await api.post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('with missing property url.', async () => {
      const newBlog = {
        title: 'Maria',
        author: 'John Doe',
        likes: 10
      }

      await api.post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('Deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid.', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

      const titles = blogsAtEnd.map(r => r.title)
      assert.strictEqual(titles.includes(blogToDelete.title), false, 'Expected titles not to contain the deleted blog title')
    })
  })

  describe('Update of a blog', () => {
    test('should update blog likes and return updated blog as JSON', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const updatedLikes = 333

      await api.put(`/api/blogs/${blogToUpdate.id}`)
        .send({ 'likes': updatedLikes })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const updatedBlog = await Blog.findById(blogToUpdate.id)

      assert.strictEqual(updatedBlog.likes, updatedLikes)
      assert.strictEqual(updatedBlog.title, blogToUpdate.title)
      assert.strictEqual(updatedBlog.author, blogToUpdate.author)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})