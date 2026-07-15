const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./db');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static upload files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Shinoraa API Server is running! 🌸');
});

// Socket.IO real-time event logic
io.on('connection', (socket) => {
  console.log('🌸 Client connected to Socket.IO:', socket.id);

  // Couple joins their relationship room
  socket.on('join_relationship', ({ relationshipId, username }) => {
    socket.join(relationshipId);
    socket.relationshipId = relationshipId;
    socket.username = username;
    console.log(`🌸 User ${username} joined relationship room: ${relationshipId}`);
    
    // Notify partner that they are online
    socket.to(relationshipId).emit('partner_online', { username, online: true });
  });

  // Partner typing indicator
  socket.on('typing', ({ relationshipId, username, isTyping }) => {
    socket.to(relationshipId).emit('partner_typing', { username, isTyping });
  });

  // Message sent
  socket.on('send_message', async (messageData) => {
    const { relationshipId, sender, content, mediaUrl, mediaType } = messageData;
    
    try {
      // Save message to DB (using unified adapter)
      const savedMsg = await db.messages.create({
        relationshipId,
        sender,
        content: content || '',
        mediaUrl: mediaUrl || '',
        mediaType: mediaType || 'text',
        reactions: [],
        readBy: [sender]
      });

      // Broadcast saved message to the room
      io.to(relationshipId).emit('receive_message', savedMsg);
    } catch (err) {
      console.error('Failed to save message:', err.message);
    }
  });

  // Message reactions
  socket.on('add_reaction', async ({ relationshipId, messageId, reaction, username }) => {
    try {
      const msg = await db.messages.findById(messageId);
      if (msg) {
        let reactions = msg.reactions || [];
        const existingIdx = reactions.findIndex(r => r.username === username);
        if (existingIdx !== -1) {
          reactions[existingIdx].reaction = reaction;
        } else {
          reactions.push({ username, reaction });
        }
        await db.messages.findByIdAndUpdate(messageId, { reactions });
        
        io.to(relationshipId).emit('message_reaction_updated', { messageId, reaction, username });
      }
    } catch (err) {
      console.error('Reaction update error:', err);
    }
  });

  // Collaborative games sync (Tic Tac Toe, Memory Match, Rock Paper Scissors)
  socket.on('game_action', ({ relationshipId, gameType, action, data }) => {
    // Broadcast the action to partner in room
    socket.to(relationshipId).emit('game_state_update', { gameType, action, data });
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (socket.relationshipId && socket.username) {
      socket.to(socket.relationshipId).emit('partner_online', { username: socket.username, online: false });
      console.log(`🌸 User ${socket.username} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 5000;

// Initialize Server after DB connection attempts
db.connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🌸 Shinoraa server running on port ${PORT} 🌸`);
  });
});
