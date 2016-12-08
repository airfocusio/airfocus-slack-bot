const bunyan = require('bunyan')

module.exports = function (name) {
  return bunyan.createLogger({
    name,
    stream: process.stdout,
    level: 'debug'
  })
}
