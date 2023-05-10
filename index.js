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

app.get('/', (req, res) => { res.send(`Available paths:
/todos
/todos/due
/todos/process/reprioritise
/todos/process/stale
`) })

app.get(`/todos${process.env.HASH}`, async (req, res) => await getAndSend(req, res, todoist.getTodos))

app.get(`/todos/due${process.env.HASH}`, async (req, res) => await getAndSend(req, res, todoist.getTodosDue))

app.get(`/todos/process/reprioritise`, async (req, res) => await getAndSend(req, res, todoist.reprioritise))

app.get(`/todos/process/stale`, async (req, res) => await getAndSend(req, res, todoist.killOld))

app.listen(3000, () => console.log('LISTENING ON 3000'))