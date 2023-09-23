const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Connect to your MongoDB database
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Create a Mongoose schema and model for your data
const imageSchema = new mongoose.Schema({
  username: String,
  data: [
    {
      title: String,
      imageUrl: { type: String, unique: true },
      description: String,
    },
  ],
});

// Create a function to dynamically get or create a collection based on the username
function getImageCollection(username) {
  return mongoose.model(`Image_${username}`, imageSchema);
}

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.send('😁    Welcome to wallipyServer    😁');
});

// Add data to MongoDB
app.post('/addData', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const { title, imageUrl, description, username } = req.body;

    // Get or create a collection for the specific username
    const Image = getImageCollection(username);

    // Check if the user already exists in the database
    let userImage = await Image.findOne({ username });

    if (!userImage) {
      // If the user doesn't exist, create a new user document
      userImage = new Image({
        username,
        data: [],
      });
    }

    // Add the new data to the user's data array
    userImage.data.push({ title, imageUrl, description });

    // Save the updated user document
    await userImage.save();
    res.status(201).json(userImage.data);
  } catch (error) {
    res.status(500).json({ error: 'Error adding data to MongoDB' });
  }
});

// Remove data from MongoDB by imageUrl
app.delete('/removeData', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const { imageUrl, username } = req.body;

    // Get the specific collection for the username
    const Image = getImageCollection(username);

    // Find the user by username
    const userImage = await Image.findOne({ username });

    if (!userImage) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove the image with the matching imageUrl from the user's data array
    userImage.data = userImage.data.filter((image) => image.imageUrl !== imageUrl);

    // Save the updated user document
    await userImage.save();

    res.json({ message: 'Image removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing data from MongoDB' });
  }
});

// Fetch all added data for a user from MongoDB
app.get('/addedData', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const { username } = req.query;

    // Get the specific collection for the username
    const Image = getImageCollection(username);

    // Find the user by username and return their data array
    const userImage = await Image.findOne({ username });

    if (!userImage) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userImage.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching added data from MongoDB' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
