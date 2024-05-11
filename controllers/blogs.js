const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const { error } = require('../utils/logger')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  if (!user) {
    return response.status(404).end()
  }
  const blog = new Blog({
    title: body.title,
    author: body.author || '',
    url: body.url,
    likes: body.likes,
    user: user._id //* Is it possible to use also user.id, does not matter in this case
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'blog has not been found' })
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)
  if (!user) {
    return response.status(404).end()
  }


  if (blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'blog does not belong to user' })
  }

  await Blog.deleteOne(blog)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const blog = { likes: request.body.likes }
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })

  response.status(200).json(updatedBlog)
})

module.exports = blogsRouter