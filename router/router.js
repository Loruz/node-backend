const express = require('express')
const router = express.Router({})
const VerifyToken = require('./VerifyToken')

router.use('/auth', require('../controllers/AuthController'))
router.all('*', VerifyToken)

module.exports = router
