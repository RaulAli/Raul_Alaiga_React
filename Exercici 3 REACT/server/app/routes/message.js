// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/send', async (req, res) => {
    const { senderUsername, receiverUsername, body } = req.body;

    try {
        if (!senderUsername || !receiverUsername || !body) {
            return res.status(400).json({ msg: 'Faltan datos (sender, receiver o body)' });
        }

        const sender = await User.findOne({ username: senderUsername });
        const receiver = await User.findOne({ username: receiverUsername });

        if (!sender || !receiver) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        const newMessage = new Message({
            body,
            sender: sender._id,
            receiver: receiver._id
        });

        await newMessage.save();

        res.status(201).json({
            msg: 'Mensaje enviado correctamente',
            message: newMessage
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error del servidor' });
    }
});

router.get('/conversation/:otherUsername', auth, async (req, res) => {
    const { otherUsername } = req.params;

    try {
        const otherUser = await User.findOne({ username: otherUsername });
        if (!otherUser) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: otherUser._id },
                { sender: otherUser._id, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error del servidor' });
    }
});


module.exports = router;
