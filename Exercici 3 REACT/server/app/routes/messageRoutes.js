const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Messages');
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');

module.exports = function (io) {
    router.post('/', auth, async (req, res) => {
        const { conversationId, body } = req.body;
        const senderId = req.user.id;

        try {
            if (!conversationId || !body) {
                return res.status(400).json({ msg: 'Faltan datos (conversationId o body)' });
            }

            const conversation = await Conversation.findOne({ _id: conversationId, members: senderId });
            if (!conversation) {
                return res.status(404).json({ msg: 'Conversación no encontrada o no eres miembro.' });
            }

            const newMessage = new Message({
                conversation: conversationId,
                sender: senderId,
                body,
                readBy: [senderId]
            });

            await newMessage.save();

            const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'username');

            // Emit the new message to the conversation room
            io.to(conversationId).emit('newMessage', populatedMessage);

            res.status(201).json(populatedMessage);

        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Error del servidor' });
        }
    });

    router.get('/unread-counts', auth, async (req, res) => {
        try {
            const userId = new mongoose.Types.ObjectId(req.user.id);

            const conversationsWithUnread = await Conversation.aggregate([
                {
                    $match: {
                        members: userId
                    }
                },
                {
                    $lookup: {
                        from: "messages",
                        let: { convId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$conversation", "$$convId"] },
                                            { $ne: ["$sender", userId] },
                                            { $not: { $in: [userId, "$readBy"] } }
                                        ]
                                    }
                                }
                            },
                            { $count: "unread" }
                        ],
                        as: "unreadCount"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        conversationId: "$_id",
                        unread: {
                            $ifNull: [{ $arrayElemAt: ["$unreadCount.unread", 0] }, 0]
                        }
                    }
                }
            ]);

            res.json(conversationsWithUnread);
        } catch (error) {
            console.error("Error fetching unread counts:", error);
            res.status(500).json({ message: "Server error" });
        }
    });

    router.get('/:conversationId', auth, async (req, res) => {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        try {
            const conversation = await Conversation.findOne({ _id: conversationId, members: userId });
            if (!conversation) {
                return res.status(403).json({ msg: 'Acceso denegado a esta conversación.' });
            }

            const totalMessages = await Message.countDocuments({ conversation: conversationId });
            const totalPages = Math.ceil(totalMessages / limit);

            const messages = await Message.find({ conversation: conversationId })
                .populate('sender', 'username')
                .populate('readBy', 'username')
                .sort({ createdAt: -1 }) // Get newest first
                .skip(skip)
                .limit(limit);

            // Reverse to show oldest of the batch first
            const reversedMessages = messages.reverse();

            res.json({
                messages: reversedMessages,
                totalPages,
                currentPage: page
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Error del servidor' });
        }
    });

    router.post('/read', auth, async (req, res) => {
        const { messageId } = req.body;
        const userId = req.user.id;

        try {
            const message = await Message.findByIdAndUpdate(
                messageId,
                { $addToSet: { readBy: userId } },
                { new: true }
            );

            if (!message) {
                return res.status(404).json({ msg: 'Mensaje no encontrado' });
            }

            res.json({ msg: 'Mensaje marcado como leído.', readBy: message.readBy });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    });

    return router;
};