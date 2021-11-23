const process = require('process');
const express = require('express');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const appName = process.env.COPILOT_APPLICATION_NAME;
const envName = process.env.COPILOT_ENVIRONMENT_NAME;
const svcName = process.env.COPILOT_SERVICE_NAME;

const app = express();
const port = 3000;''
const wrap = (fn) => (...args) => fn(...args).catch(args[2]);

const ddbClient = new DynamoDBClient({ region: 'ap-northeast-1' });
const snsClient = new SNSClient({ region: 'ap-northeast-1' });
const { helloTopic } = JSON.parse(process.env.COPILOT_SNS_TOPIC_ARNS);

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.get('/send', wrap(async (req, res) => {
  const body = `HELLO_${Date.now()}`
  const data = await ddbClient.send(new PutItemCommand({
    TableName: `${appName}-${envName}-${svcName}-messages`,
    Item: {
      id: { S: `${Date.now()}` },
      body: { S: body },
    },
  }));
  console.log('data', JSON.stringify(data));

  const out = await snsClient.send(new PublishCommand({
    Message: body,
    TopicArn: helloTopic,
  }));
  res.json({
    helloTopic,
    out,
    data,
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
