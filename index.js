import wtf from './api/wtf'
import fpl from './api/fpl'
import express from 'express'
require('dotenv').config()

const  app = express()

const getAndSend = async (req, res, func) => {
  try {
    const data = await func(req.params)
    res.send(data)
  } catch(err) {
    console.log(err)
  }
}

app.get('/', async (req, res) => await getAndSend(req, res, wtf.getDataAll))

app.get('/rawFPLData/', async (req, res) => await getAndSend(req, res, wtf.getRawFpl))

app.get('/lists/predictedScore/', async (req, res) => await getAndSend(req, res, wtf.getListPredictedScore))

app.get('/lists/transfers/', async (req, res) => await getAndSend(req, res, wtf.getListTransfers))

app.get('/lists/topScore/', async (req, res) => await getAndSend(req, res, wtf.getListTopScore))

app.get('/user/:userId/', async (req, res) => await getAndSend(req, res, fpl.getUser))

app.get('/user/:userId/:eventId', async (req, res) => await getAndSend(req, res, fpl.getUserPicks))

app.get('/teams/', async (req, res) => {
  try{
    const data = await wtf.getDataAll()
    res.send(data.teams)
  } catch(err) {
    console.log(err)
  }
})

app.listen(3000, () => console.log('LISTENING ON 3000'))