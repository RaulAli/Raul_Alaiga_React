require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // URL of your React client
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Conectado a MongoDB');
}).catch(err => {
    console.error('Error de conexión a MongoDB:', err);
});

// Pass `io` to the routes
app.use('/api/auth', require('./app/routes/auth'));
app.use('/api/messages', require('./app/routes/messageRoutes')(io));
app.use('/api/conversations', require('./app/routes/conversationRoutes')(io)); // Pass io instance

app.get('/', (req, res) => {
    res.send('API del chat funcionando');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    // Join a room based on user ID for personal notifications
    const token = socket.handshake.query.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.user.id;
            socket.join(userId);
            console.log(`User with ID ${userId} joined their personal room`);
        } catch (err) {
            console.log('Invalid token for socket connection.');
        }
    }

    socket.on('joinConversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`User joined conversation: ${conversationId}`);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
