const express = require('express')
const router = express.Router()

router.get('/test', (req, res) => {
  res.send({
    msg: 'yo'
  })
})

module.exports = router
