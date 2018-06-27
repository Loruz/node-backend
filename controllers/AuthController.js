/*
* AuthController:
* @exports router.post (/register)
* @exports router.post (/login)
* */

const express = require('express')
const {check, validationResult} = require('express-validator/check')
const {validationErrorHandler, textErrorHandler} = require('../helpers/errorHandlers')
const router = express.Router({})
const config = require('../config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

/*
* Register user and send jwt token
* @params: req.body Object containing registering user credentials
* */

router.post('/register',
  /*
  * Validate given form inputs
  * */
  [check('name')
    .isLength({min: 5}).withMessage('Name must contain at least 5 characters'),
    check('email')
      .isEmail().withMessage('Email must be valid')
      .custom((value, {req}) => {
        return new Promise((resolve, reject) => {
          User.findOne({email: req.body.email}, (err, user) => {
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
    let errors = validationErrorHandler(validationResult(req))
    if (Object.keys(errors).length) {
      return res.status(404).send({errors: errors})
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
      if (err) return res.status(500).send(textErrorHandler('Server error.'))

      let token = jwt.sign({id: user._id}, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      })

      res.status(200).send({auth: true, token: token})
    })
  })

/*
* Sign in user and send jwt token
* @params: req.body Object containing registering user credentials
* */

router.post('/login',
  /*
  * Validate given form inputs
  * */
  [
    check('email')
      .isEmail().withMessage('User email should be valid'),
    check('password')
      .exists().withMessage('User password is required')
  ],
  (req, res) => {
    /*
    * Check for validation errors and set if any
    * */

    let errors = validationErrorHandler(validationResult(req))
    if (Object.keys(errors).length) {
      return res.status(404).send({errors: errors})
    }
    /*
    * If no errors find User by credentials, generate JWT and sign in.
    * */

    User.findOne({email: req.body.email}, (err, user) => {git
      if (err) return res.status(500).send(textErrorHandler('Server error.'))
      if (!user) return res.status(404).send(textErrorHandler('User not found.'))
      /*
      * Check if password is valid
      * */
      let passwordIsValid = bcrypt.compareSync(req.body.password, user.password)
      if (!passwordIsValid) return res.status(404).send(textErrorHandler('Credentials are not valid'))
      /*
      * if user is found and password is valid create a token and send response
      * */
      let token = jwt.sign({id: user._id}, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      })
      res.status(200).send({auth: true, token: token})
    })
  })

module.exports = router
