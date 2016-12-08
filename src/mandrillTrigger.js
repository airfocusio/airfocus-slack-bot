const bodyParser = require('body-parser')
const createLogger = require('./createLogger')
const crypto = require('crypto')
const express = require('express')

const log = createLogger('mandrill')

function success (res) {
  res.writeHead(200, {'content-type': 'text/plain'})
  res.write('Ok')
  res.end()
}

function fail (res, status, message) {
  res.writeHead(status, {'content-type': 'text/plain'})
  res.write(message)
  res.end()
}

function validateRequest (req, webhookUrl, webhookKey) {
  const stringToSign = Object.keys(req.body).sort().reduce((s, k) => s + k + req.body[k], webhookUrl)
  const signature = crypto.createHmac('sha1', webhookKey).update(stringToSign, 'utf8', 'binary').digest('base64')
  return req.headers['x-mandrill-signature'] === signature
}

function mapEventToSlackMessage (type, message) {
  switch (type) {
    case 'send':
      return {
        username: 'Mandrill',
        icon_emoji: ':email:',
        text: `Sent mail`,
        attachments: [
          {
            fallback: `It was sent to ${message.email}`,
            fields: [
              {title: 'Sent To', value: message.email, short: true},
              {title: 'Subject', value: message.subject, short: true}
            ]
          }
        ]
      }
    case 'deferral':
      return {
        username: 'Mandrill',
        icon_emoji: ':email:',
        text: `Mail was deferred`,
        attachments: [
          {
            fallback: `It was sent to ${message.email}`,
            color: 'warning',
            fields: [
              {title: 'Sent To', value: message.email, short: true},
              {title: 'Subject', value: message.subject, short: true},
              {title: 'Error Description', value: message.diag || 'No description provided.', short: false}
            ]
          }
        ]
      }
    case 'soft_bounce':
      return {
        username: 'Mandrill',
        icon_emoji: ':email:',
        text: `Mail bounced softly`,
        attachments: [
          {
            fallback: `It was sent to ${message.email}`,
            color: 'danger',
            fields: [
              {title: 'Sent To', value: message.email, short: true},
              {title: 'Subject', value: message.subject, short: true},
              {title: 'Error Description', value: message.diag || 'No description provided.', short: false}
            ]
          }
        ]
      }
    case 'hard_bounce':
      return {
        username: 'Mandrill',
        icon_emoji: ':email:',
        text: `Mail bounced hard`,
        attachments: [
          {
            fallback: `It was sent to ${message.email}`,
            color: 'danger',
            fields: [
              {title: 'Sent To', value: message.email, short: true},
              {title: 'Subject', value: message.subject, short: true},
              {title: 'Error Description', value: message.diag || 'No description provided.', short: false}
            ]
          }
        ]
      }
    case 'reject':
      return {
        username: 'Mandrill',
        icon_emoji: ':email:',
        text: `Mail was rejected`,
        attachments: [
          {
            fallback: `It was sent to ${message.email}`,
            color: 'danger',
            fields: [
              {title: 'Sent To', value: message.email, short: true},
              {title: 'Subject', value: message.subject, short: true},
              {title: 'Error Description', value: message.diag || 'No description provided.', short: false}
            ]
          }
        ]
      }
    case 'spam':
      return {
        username: 'Mandrill',
        icon_emoji: ':email:',
        text: `Mail was marked as spam`,
        attachments: [
          {
            fallback: `It was sent to ${message.email}`,
            color: 'danger',
            fields: [
              {title: 'Sent To', value: message.email, short: true},
              {title: 'Subject', value: message.subject, short: true},
              {title: 'Error Description', value: message.diag || 'No description provided.', short: false}
            ]
          }
        ]
      }
    default:
      return null
  }
}

module.exports = function (slackEventSource, mandrillWebhookConfig) {
  const router = express.Router()

  router.head('/', (req, res) => {
    res.writeHead(200)
    res.end()
  })
  router.post('/', bodyParser.urlencoded({extended: true}), (req, res) => {
    if (validateRequest(req, mandrillWebhookConfig.url, mandrillWebhookConfig.key)) {
      try {
        const events = JSON.parse(req.body['mandrill_events'])
        const messages = events.map((ev) => {
          log.info(`Received ${ev.event} event`)
          return mapEventToSlackMessage(ev.event, ev.msg)
        })
        messages.filter((msg) => Boolean(msg)).forEach((msg) => slackEventSource.emit('send', msg))
        success(res)
      } catch (err) {
        log.error({err}, 'Handling webhook failed')
        fail(res, 500, 'Internal server error')
      }
    } else {
      log.warn('Received webhook with invalid signature')
      fail(res, 400, 'Invalid signature')
    }
  })

  return router
}
