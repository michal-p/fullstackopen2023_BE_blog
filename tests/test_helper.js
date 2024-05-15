const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = (user) => {
  return (
    [
      {
        _id: '5a422a851b54a676234d17f7',
        title: 'test React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
        user: user.id,
        __v: 0
      },
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        user: user.id,
        __v: 0
      }
    ]
  )
}

const blogsInDb = async () => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  return blogs.map(blog => blog.toJSON()) //!This method toJSON() in context of Mongoose deserialize documents from MongoDB to Javascript objects
}

const nonExistingBlogId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', author: 'noname', url: 'www.noname.sk' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const rootUserInDb = async () => {
  const rootUser = await User.findOne({ username: process.env.TEST_ROOT_USER_USERNAME })

  if (!rootUser) throw new Error('Root user not found in the database')

  return rootUser
}

module.exports = {
  initialBlogs,
  blogsInDb,
  nonExistingBlogId,
  usersInDb,
  rootUserInDb
}