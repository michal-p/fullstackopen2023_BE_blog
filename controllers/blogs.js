const blogsRouter = require('express').Router()
const middleware = require('../utils/middleware')
const Blog = require('../models/blog')
const { error } = require('../utils/logger')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 })

  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  if (!user) {
    return response.status(404).end()
  }
  const blogObject = new Blog({
    title: body.title,
    author: body.author || '',
    url: body.url,
    likes: body.likes,
    user: user._id //* Is it possible to use also user.id, does not matter in this case
  })

  const savedBlog = await blogObject.save()
  const createdBlog = await Blog.findById(savedBlog.id).populate('user', { username: 1, name: 1 })
  user.blogs = user.blogs.concat(createdBlog._id)
  await user.save()

  response.status(201).json(createdBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user

  if (!user) {
    return response.status(404).json({ error: 'user has not been found' })
  }

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog has not been found' })
  }
  if (blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'forbidden: blog does not belong to user' })
  }

  await Blog.deleteOne({ _id: request.params.id })
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, body, { new: true }).populate('user', { username: 1, name: 1 })

  response.status(200).json(updatedBlog)
})

module.exports = blogsRouter