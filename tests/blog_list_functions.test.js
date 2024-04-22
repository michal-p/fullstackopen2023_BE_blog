const { test, describe } = require('node:test')
const assert = require('node:assert')
const { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes } = require('../utils/blog_list_functions')
const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]
const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  }
]

test('dummy returns one', () => {
  const result = dummy([])
  assert.equal(result, 1)
})

describe('Total likes', () => {

  test('of empty list is zero', () => {
    const result = totalLikes([])

    assert.strictEqual(result, 0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const result = totalLikes(listWithOneBlog)

    assert.strictEqual(result, 5)
  })

  test('of bigger list is calculated right', () => {
    const result = totalLikes(blogs)

    assert.strictEqual(result, 36)
  })
})

describe('Favorite Blog', () => {

  test('of empty list is null', () => {
    const result = favoriteBlog([])

    assert.strictEqual(result, null)
  })

  test('when list has only one blog equals the likes of that', () => {
    const result = favoriteBlog(listWithOneBlog)
    const { title, author, likes } = listWithOneBlog[0]

    const expected = { title, author, likes }
    assert.deepStrictEqual(result, expected)
  })

  test('of bigger list is calculated right', () => {
    const result = favoriteBlog(blogs)
    const { title, author, likes } = blogs[2]

    assert.deepStrictEqual(result, { title, author, likes })
  })
})

describe('The author with most blogs', () => {

  test('of empty blogList', () => {
    const result = mostBlogs([])

    assert.strictEqual(result, null)
  })

  test('when bloglist has only one record', () => {
    const result = mostBlogs(listWithOneBlog)

    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      blogs: 1
    })
  })

  test('when bloglist has lots of records of different authors', () => {
    const result = mostBlogs(blogs)

    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      blogs: 3
    })
  })
})

describe('The author with most likes', () => {

  test('of empty blogList', () => {
    const result = mostLikes([])

    assert.strictEqual(result, null)
  })

  test('when bloglist has only one record', () => {
    const result = mostLikes(listWithOneBlog)

    assert.deepStrictEqual(result, { author: 'Edsger W. Dijkstra', likes: 5 })
  })

  test('when bloglist has lots of records of different authors', () => {
    const result = mostLikes(blogs)

    assert.deepStrictEqual(result, { author: 'Edsger W. Dijkstra', likes: 17 })
  })
})
