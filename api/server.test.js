const db = require('../data/dbConfig');
const server = require('./server');
const request = require('supertest');
const jokes = require('./jokes/jokes-data');
// Write your tests here
beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
})

beforeEach(async () => {
  await db('users').truncate();
})

afterAll(async () => {
  await db.destroy();
})

test('sanity', async () => {
  expect(process.env.NODE_ENV).toBe('testing');
})

const object = {
  "id": 1,
  "username": "Jack",
}

describe('auth HTTP register tests', () => {
  test('POST register works', async () => {
    let res = await request(server).post('/api/auth/register').send({ username: 'Jack', password: '1234' })
    expect(res.body).toMatchObject(object)
  })
  test('POSTing empty username or password returns error', async () => {
    let res = await request(server).post('/api/auth/register').send({ password: '1234' })
    expect(res.body.message).toBe('username and password required');

    await request(server).post('/api/auth/register').send({ username: 'Jack' })
    expect(res.body.message).toBe('username and password required');
  })
})

describe('auth HTTP login tests', () => {
  test('POST login works', async () => {
    let res = await request(server).post('/api/auth/register').send({ username: 'Jack', password: '1234' })

    res = await request(server).post('/api/auth/login').send({ username: 'Jack', password: '1234' })
    expect(res.body.message).toBe('Welcome back Jack!')
  })
  test('POSTing an empty username or password returns error', async () => {
    let res = await request(server).post('/api/auth/login').send({ password: '1234' })
    expect(res.body.message).toBe('username and password required')
    
    await request(server).post('/api/auth/login').send({ username: 'Jack' })
    expect(res.body.message).toBe('username and password required')
  })
  test('POSTing an incorrect password returns error', async () => {
    let res = await request(server).post('/api/auth/login').send({ username: 'Jack', password: '5678' })
    expect(res.body.message).toBe('invalid credentials')
  })
})


