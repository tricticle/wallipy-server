const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Define CORS options
const corsOptions = {
  origin: ['http://wallipy.art'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

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

// Add data to MongoDB
app.post('/addData', async (req, res) => {
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