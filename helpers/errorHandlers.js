module.exports = {
  validationErrorHandler (errors) {
    let err = {}
    Object.keys(errors).forEach(field => {
      err[field] = errors[field]['msg']
    })
    return err
  }
}
