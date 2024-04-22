// Load the full build.
var _ = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => 1

const totalLikes = (blogs) => {
  return blogs.reduce((acc, curr) => {
    return acc + curr.likes
  }, 0)
}

/**
 * Finds the favorite blog from a list of blogs.
 *
 * @param {Array} blogs - The list of blogs to search from.
 * @returns {Object|null} - The favorite blog object containing title, author, and likes, or null if the list is empty.
 */
const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  return blogs.reduce((acc, curr) => {
    const { title, author, likes } = curr
    return likes >= (acc.likes || 0)
      ? { title, author, likes }
      : acc
  }, {})
}

const mostBlogs = (blogList) => {
  if (blogList.length === 0) return null

  const biggestWriters = _.countBy(blogList, 'author' )
  const biggestValue = _.max(_.values(biggestWriters))
  const biggestAuthor = _.findKey(biggestWriters, (value) => value === biggestValue)

  return { author: biggestAuthor, blogs: biggestValue }
}

const mostLikes = (blogList) => {
  if (blogList.length === 0) return null

  const authorsWithMaxLikes = _.reduce(blogList, (acc, curr) => {
    if (curr.author && curr.likes) {
      if (acc[curr.author]) {
        acc[curr.author] += curr.likes
      } else {
        acc[curr.author] = curr.likes
      }
    }
    return acc
  }, {})

  return _.transform(authorsWithMaxLikes, (result, likes, author) => {
    if (likes > (result.likes || 0)) {
      result.author = author
      result.likes = likes
    }
  }, {})
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}