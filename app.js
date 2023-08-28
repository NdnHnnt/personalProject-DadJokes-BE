require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Import the cors package
const app = express();
const userRoutes = require('./routes/users');
const jokeRoutes = require('./routes/jokes');

app.use(express.json());

// Use cors middleware
app.use(cors()); // Enable CORS for all routes and origins

// Define your routes
app.use('/users', userRoutes);
app.use('/jokes', jokeRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

module.exports = app;
