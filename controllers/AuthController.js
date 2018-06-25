const express = require('express')
const {check, validationResult} = require('express-validator/check')
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
        // trow error if passwords do not match
        throw new Error('Passwords don\'t match')
      } else {
        return value
      }
    })
], (req, res) => {
  const validationErrors = validationResult(req)
  let errors = {}
  if (!validationErrors.isEmpty()) {
    Object.keys(validationErrors.mapped()).forEach(field => {
      errors[field] = validationErrors.mapped()[field]['msg']
    })
  }
  if (Object.keys(errors).length) {
    return res.status(422).json({errors: errors})
  }
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
