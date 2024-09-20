const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // To parse JSON request bodies

// Define a POST route to handle the webhook event
app.post('/webhook', (req, res) => {
  // Log the incoming webhook payload from Airtable
  console.log('Webhook payload received:', req.body);

  // Respond to Airtable to acknowledge the webhook
  res.status(200).send('Webhook received');
});

app.get('/', (req, res) => {
  res.status(200).send("<h2>Hi there</h2>");
})


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
