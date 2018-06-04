const express = require('express')
const app = express()
const router = require('./router/router')
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(router)

module.exports = app
