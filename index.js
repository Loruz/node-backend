const express = require('express')
const app = express()
const cors = require('cors')
const router = require('./router/router')
const bodyParser = require('body-parser')

app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

require('./db/db')

app.use(router)

module.exports = app
