const express = require('express')
const router = express.Router({})

router.use('/auth', require('../controllers/AuthController'))

module.exports = router
