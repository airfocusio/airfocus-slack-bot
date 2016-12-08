const axios = require('axios')
const createLogger = require('./createLogger')
const EventEmitter = require('events')

const log = createLogger('slack')

module.exports = function (slackWebhookConfig) {
  const eventEmitter = new EventEmitter()

  eventEmitter.on('send', (message) => {
    axios.post(slackWebhookConfig.url, message)
      .then(() => log.info({message}, 'Sending message to slack'))
      .catch((err) => log.error({err}, 'Unable to send message to slack'))
  })

  return eventEmitter
}
