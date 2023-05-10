import * as dotenv from 'dotenv'
dotenv.config({path: '.env'})

import express from 'express'

import todoist from './api/todoist'

const app = express()

const getAndSend = async (req, res, func) => {
  try {
    const data = await func(req.params)
    res.send(data)
  } catch(err) {
    console.log(err)
  }
}

app.get('/', async (req, res) => { return 'Add something, bozo' })

app.get(`/todos${process.env.HASH}`, async (req, res) => await getAndSend(req, res, todoist.getTodos))

app.get(`/todos/due${process.env.HASH}`, async (req, res) => await getAndSend(req, res, todoist.getTodosDue))

app.get(`/todos/process/reprioritise${process.env.HASH}`, async (req, res) => await getAndSend(req, res, todoist.reprioritise))

app.get(`/todos/process/stale${process.env.HASH}`, async (req, res) => await getAndSend(req, res, todoist.killOld))

app.listen(3000, () => console.log('LISTENING ON 3000'))