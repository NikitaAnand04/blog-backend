const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const expressjwt = require('express-jwt');
const jwt = require('jsonwebtoken');

const secret = 'verysecret';

const privatedb = mongoose.createConnection('mongodb://localhost:27017/privatedb');
const publicdb = mongoose.createConnection('mongodb://13.235.241.64:27017/publicdb');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String
}, { timestamps: true });
const User = privatedb.model('User', userSchema);

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  user: {
    type: mongoose.Types.ObjectId
  }
}, { timestamps: true });

const Blog = publicdb.model('Blog', blogSchema);

// defining the Express app
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

app.use(expressjwt({ secret, algorithms: ['HS256'] }).unless({ path: ['/', '/signin', '/signup'] }));

// defining an endpoint to return all ads
app.get('/', async (_, res) => {
  try {
    const blogs = await Blog.find().populate('user', '-password', User);
    return res.json({ success: true, blogs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});


app.get('/blog', async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.user._id }).populate('user', '-password', User);
    return res.json({ success: true, blogs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/blog', async (req, res) => {
  try {
    const blog = await Blog.create({ ...req.body, user: req.user._id });
    return res.json({ success: true, blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/signin', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email, password: req.body.password }).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    const token = jwt.sign(user.toJSON(), secret, { expiresIn: '1d' })
    return res.json({ success: true, user, token });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: error.message });
  }
})

app.post('/signup', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ email: req.body.email }, req.body, { upsert: true, new: true }).select('-password');
    const token = jwt.sign(user.toJSON(), secret, { expiresIn: '1d' })
    return res.json({ success: true, token, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
})

app.listen(8080, () => {
  console.log('Server running on port 8080');
});

privatedb.once('open', () => {
  console.log('Private db connected');
});

publicdb.once('open', () => {
  console.log('Public db connected');
});