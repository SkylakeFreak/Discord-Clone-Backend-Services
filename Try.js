const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3005;
const SECRET_KEY = '43242355ghbvhh234bjjn'; // Replace with a more secure key in production

// In-memory storage for users (for demonstration purposes)
const users = [{ id: 1, username: 'testuser', password: 'password' }];

app.use(express.json());

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Generate a JWT token
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

  res.json({ token });
});

// Middleware to authenticate requests
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Protected route example
app.get('/protected', authenticate, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}` });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
