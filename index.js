const createLogger = require('./src/createLogger')
const express = require('express')
const http = require('http')
const mandrillTrigger = require('./src/mandrillTrigger')
const slackSender = require('./src/slackSender')

const slackWebhookConfig = {
  url: process.env.SLACK_WEBHOOK_URL
}

const mandrillWebhookConfig = {
  url: process.env.MANDRILL_WEBHOOK_URL,
  key: process.env.MANDRILL_WEBHOOK_KEY
}

const log = createLogger('http')
const slack = slackSender(slackWebhookConfig)
const app = express()
  .use('/mandrill', mandrillTrigger(slack, mandrillWebhookConfig))

http.createServer(app).listen(8080, () => log.info('Listening on http://0.0.0.0:8080'))
