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
  title: String,
  imageUrl: { type: String, unique: true }, // Make imageUrl field unique
  description: String,
});

const Image = mongoose.model('Image', imageSchema);

app.use(bodyParser.json());

// Define routes to add, remove, and fetch data

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://wallipy.art/");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Origin", "Origin");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Accept");
  res.header("Origin", "*");
  res.header("Access-Control-Allow-Methods","*");
  res.header("Allow","*");
  next()
});

app.get('/', (req, res) => {
  res.send('😁    Welcome to wallipyServer    😁')
  res.set('Access-Control-Allow-Origin', '*');
})

// Add data to MongoDB
app.post('/addData', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const { title, imageUrl, description } = req.body;
    const newImage = new Image({ title, imageUrl, description });
    await newImage.save();
    res.status(201).json(newImage);
  } catch (error) {
    res.status(500).json({ error: 'Error adding data to MongoDB' });
  }
});

// Remove data from MongoDB by imageUrl
app.delete('/removeData', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const { imageUrl } = req.body;
    const image = await Image.findOneAndRemove({ imageUrl });
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json({ message: 'Image removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing data from MongoDB' });
  }
});

// Fetch all added data from MongoDB
app.get('/addedData', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const addedData = await Image.find();
    res.json(addedData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching added data from MongoDB' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});