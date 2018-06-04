const numCPUs = require('os').cpus().length
const cluster = require('cluster')
const http = require('http')
const PORT = process.env.PORT || 3000
const app = require('../index')

/**
 * create server
 */
let server

if (cluster.isMaster) {
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', function (worker) {
    console.log('worker ' + worker.process.pid + ' died')
  })
} else {
  server = http.createServer(app)

  server.listen(PORT)
  server.on('error', onError)
  server.on('listening', onListening)
}

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(PORT + ' requires elevated privileges')
      break
    case 'EADDRINUSE':
      console.error(PORT + ' is already in use')
      break
    default:
      throw error
  }

  process.exit(1)
}

function onListening () {
  console.log('Listening on ' + PORT)
}
