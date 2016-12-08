# airfocus-slack-bot

```bash
export SLACK_WEBHOOK_URL="..."
export MANDRILL_WEBHOOK_URL="..."
export MANDRILL_WEBHOOK_KEY="..."
npm start
```

```bash
docker run -d \
  -p 8080:8080 \
  -e SLACK_WEBHOOK_URL="..." \
  -e MANDRILL_WEBHOOK_URL="..." \
  -e MANDRILL_WEBHOOK_KEY="..." \
  choffmeister/airfocus-slack-bot:latest
```
