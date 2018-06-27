module.exports = {
  validationErrorHandler (validationResult) {
    let err = {}
    if (!validationResult.isEmpty()) {
      Object.keys(validationResult.mapped()).forEach(field => {
        err[field] = validationResult.mapped()[field]['msg']
      })
    }
    return err
  },
  textErrorHandler (text) {
    return {
      errors: {
        message: text
      }
    }
  }
}
