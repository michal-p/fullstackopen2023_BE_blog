// Load the full build.
var _ = require('lodash')

const dummy = (blogs) => {
  console.log(blogs)
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((acc, curr) => {
    return acc + curr.likes
  }, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  return blogs.reduce((acc, curr) => {
    const { title, author, likes } = curr
    return !acc.likes || likes >= acc.likes
      ? { title, author, likes }
      : acc
  }, {})
}

const mostBlogs = (blogsList) => {
  if (blogsList.length === 0) return { author: null, blogs: 0 }

  const biggestWriters = _.countBy(blogsList, 'author' )
  const biggestValue = _.max(Object.values(biggestWriters))
  const biggestAuthor = _.findKey(biggestWriters, (value) => value === biggestValue)

  return {
    author: biggestAuthor,
    blogs: biggestValue
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  authorWithTheMostBlogs: mostBlogs
}