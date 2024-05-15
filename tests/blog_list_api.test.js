const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const helper = require('./test_helper')

const Blog = require('../models/blog')
const User = require('../models/user')

describe('When there is initially some blogs saved', () => {
  let rootUser // Declare a global variable to hold the user
  let blogs

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash(process.env.TEST_ROOT_USER_PASSWORD, 10)
    const user = new User({ username: process.env.TEST_ROOT_USER_USERNAME, passwordHash })

    await user.save()

    // Find the user in the database and assign it to the global variable
    rootUser = await helper.rootUserInDb()

    await Blog.deleteMany({})
    blogs = await Blog.insertMany(helper.initialBlogs(rootUser))
  })

  describe('When return all blogs', () => {
    
    test('content type of blogs are returned as json.', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
  
    test('count of all blogs are returned', async () => {
      const response = await api.get('/api/blogs')
  
      assert.strictEqual(response.body.length, blogs.length)
    })
  
    test('existence of unique identifier property.', async () => {
      const response = await api.get('/api/blogs/')
      const blogs = response.body
      for (const blog of blogs) {
        assert.ok(blog.id, 'Expected id property to be defined.');
      }
    })
  })

  describe('View a specific blog', () => {

    test('succeeds with a valid id.', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const blogToView = blogsAtStart[0]

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.deepStrictEqual(resultBlog.body, blogToView)//(actual, expected)
    })

    test('fails with statuscode 404 if blog does not exist.', async () => {
      const validNonexistingId = await helper.nonExistingBlogId()

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

  describe('When authenticated', () => {
    let token // Token for authenticated requests

    // Setup before running the tests
    beforeEach(async () => {

      // Login the user and store the token
      const loginResponse = await api.post('/api/login').send({
        username: process.env.TEST_ROOT_USER_USERNAME,
        password: process.env.TEST_ROOT_USER_PASSWORD,
      })

      token = loginResponse.body.token
    })

    describe('When create a new blog', () => {

      test('cannot create a blog without a token', async () => {
        const newBlog = {
          title: 'Unauthorized Blog Post',
          author: 'Hacker',
          url: 'http://malicious.example.com',
          likes: 0,
        }
  
        await api.post('/api/blogs')
          .send(newBlog)
          .expect(401) // Assuming 401 Unauthorized for no token
      })
  
      test('can create a blog with a valid token', async () => {
        const newBlog = {
          title: 'Authorized Blog Post',
          author: 'Valid User',
          url: 'http://valid.example.com',
          likes: 10,
        }
  
        const response = await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`) // Set the Authorization header with the token
          .send(newBlog)
          .expect(201)
          .expect('Content-Type', /application\/json/)
  
        // Verify the blog was created correctly
        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, blogs.length + 1, 'Number of blogs should have increased by 1')
        
        const createdBlog = blogsAtEnd.find(blog => blog.id === response.body.id)
        const { title, author, url, likes } = createdBlog
        assert.deepStrictEqual({ title, author, url, likes }, newBlog)
      })
  
  
      test('expect default value, when is missing property `likes`.', async () => {
  
        const newBlog = {
          title: 'Aaaaaa',
          author: 'Edsgerrrrrr WWWWW. Dijkstraaaaa',
          url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html'
        }
  
        await api.post('/api/blogs/')
          .set('Authorization', `Bearer ${token}`)
          .send(newBlog)
          .expect(201)
          .expect('Content-Type', /application\/json/)
  
        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, blogs.length + 1)
  
        const lastBlogInDB = blogsAtEnd[blogsAtEnd.length - 1]
        assert.ok('likes' in lastBlogInDB)
        assert.strictEqual(lastBlogInDB.likes, 0)
      })

      test('expect no blog is created while missing properties title and url.', async () => {

        const newBlog = {
          author: 'John Doe',
          likes: 10
        }

        await api.post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
          .send(newBlog)
          .expect(400)

        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, blogs.length)
      })

      test('expect no blog is created while with missing property title.', async () => {
  
        const newBlog = {
          url: 'https://reactpatterns.com/',
          author: 'John Doe',
          likes: 10
        }
  
        await api.post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
          .send(newBlog)
          .expect(400)
  
        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, blogs.length)
      })
  
      test('expect no blog is created while with missing property url.', async () => {
        const newBlog = {
          title: 'Maria',
          author: 'John Doe',
          likes: 10
        }
  
        await api.post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
          .send(newBlog)
          .expect(400)
  
        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, blogs.length)
      })
    })

    describe('Deletion of a blog', () => {
      test('succeeds with status code 204 if id is valid.', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]

        await api
          .delete(`/api/blogs/${blogToDelete.id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204)

        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, blogs.length - 1)

        const titles = blogsAtEnd.map(r => r.title)
        assert.strictEqual(titles.includes(blogToDelete.title), false, 'Expected titles not to contain the deleted blog title')
      })
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