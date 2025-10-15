const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
const mongoURL = process.env.MONGO_URL || 'mongodb://mongo:27017/testdb';

app.get('/api/hello', async (req, res) => {
  try {
    await mongoose.connect(mongoURL);
    res.json({ msg: 'Hello from Backend!', mongo: 'Connected ✅' });
  } catch (err) {
    res.json({ msg: 'Hello from Backend!', mongo: 'Not Connected ❌' });
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
