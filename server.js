const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Store active boards
const boards = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join-board', (boardId) => {
    socket.join(boardId);
    if (!boards.has(boardId)) {
      boards.set(boardId, {
        content: '',
        elements: []
      });
    }
    socket.emit('board-state', boards.get(boardId));
  });

  socket.on('update-content', ({ boardId, content }) => {
    if (boards.has(boardId)) {
      boards.get(boardId).content = content;
      io.to(boardId).emit('content-updated', content);
    }
  });

  socket.on('add-element', ({ boardId, element }) => {
    if (boards.has(boardId)) {
      boards.get(boardId).elements.push(element);
      io.to(boardId).emit('element-added', element);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 