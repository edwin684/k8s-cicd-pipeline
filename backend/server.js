const express = require('express');
const app = express();

const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGO_URL || 'mongodb://mongo:27017/testdb';

app.get('/api/hello', (req, res) => {
  res.json({ msg: 'Hello from backend', mongo: mongoUrl });
});

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.listen(port, () => console.log(`Backend listening on ${port}`));
