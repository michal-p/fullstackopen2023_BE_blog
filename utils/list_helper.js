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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}