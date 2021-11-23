const process = require('process');
const express = require('express');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const app = express();
const port = 3000;
const wrap = (fn) => (...args) => fn(...args).catch(args[2]);

const client = new SNSClient({ region: 'ap-northeast-1' });
const { helloTopic } = JSON.parse(process.env.COPILOT_SNS_TOPIC_ARNS);

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.get('/send', wrap(async (req, res) => {
  const out = await client.send(new PublishCommand({
    Message: 'HELLO',
    TopicArn: helloTopic,
  }));
  res.json({
    helloTopic,
    out,
  });
}));
app.use((err, req, res, next) => {
  if (err) {
    res.status(500);
    res.send(err);
  } else {
    res.send('OK');
  }
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
process.on('SIGINT', () => {
  process.exit(0);
});
