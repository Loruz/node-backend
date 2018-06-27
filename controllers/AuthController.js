const express = require('express')
const {check, validationResult} = require('express-validator/check')
const {validationErrorHandler} = require('../helpers/errorHandlers')
const router = express.Router({})
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

/*
* Register user and send jwt token
* @params: req.body Object containing registering user credentials
* */

router.post('/register', [
  check('name')
    .isLength({min: 5}).withMessage('Name must contain at least 5 characters'),
  check('email')
    .isEmail().withMessage('Email must be valid')
    .custom((value, {req}) => {
      return new Promise((resolve, reject) => {
        User.findOne({email: req.body.email}, function (err, user) {
          if (err) {
            reject(new Error('Server Error'))
          }
          if (user) {
            reject(new Error('E-mail already in use'))
          }
          resolve(true)
        })
      })
    }),
  check('password')
    .isLength({min: 6}).withMessage('Password must contain at least 6 characters')
    .custom((value, {req}) => {
      if (value !== req.body.passwordConfirm) {
        throw new Error('Passwords don\'t match')
      } else {
        return value
      }
    })
], (req, res) => {
  /*
  * Check for validation errors and set if any
  * */
  const validationErrors = validationResult(req)
  let errors = {}
  if (!validationErrors.isEmpty()) {
    errors = validationErrorHandler(validationErrors.mapped())
  }
  if (Object.keys(errors).length) {
    return res.status(404).json({errors: errors})
  }

  /*
  * If no errors hash password generate JWT  and store User to DB
  * */
  let hashedPassword = bcrypt.hashSync(req.body.password, 8)
  User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  }, (err, user) => {
    if (err) return res.status(500).json('There was a problem registering the user`.')

    let token = jwt.sign({id: user._id}, 'secret', {
      expiresIn: 86400 // expires in 24 hours
    })

    res.status(200).json({auth: true, token: token})
  })
})

/*
* Sign in user and send jwt token
* */

module.exports = router
