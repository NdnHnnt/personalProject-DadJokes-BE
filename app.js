require('dotenv').config();
const express = require('express');
const app = express();
const userRoutes = require('./routes/users');
const jokeRoutes = require('./routes/jokes');

app.use(express.json());
app.use('/users', userRoutes);
app.use('/jokes', jokeRoutes);
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

module.exports = app;