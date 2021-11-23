const process = require('process');
const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const queueUrl = process.env.COPILOT_QUEUE_URI;
const client = new SQSClient({ region: 'ap-northeast-1' });

(async () => {
  console.log('queueUrl', queueUrl);
  while (true) {
    try {
      const out = await client.send(new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        WaitTimeSeconds: 10,
      }))
      console.log('out', JSON.stringify(out));
      if (out.Messages === undefined || out.Messages.length === 0) {
        continue;
      }
      for (const message of out.Messages) {
        console.log('message', JSON.stringify(message));
      }
      await client.send(new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: out.Messages[0].ReceiptHandle,
      }))
    } catch (err) {
      console.error(err);
    }
  }
})();

process.on('SIGINT', () => {
  process.exit(0)
});
