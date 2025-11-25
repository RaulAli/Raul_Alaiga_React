const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

module.exports = function(io) {
    router.post('/', auth, async (req, res) => {
        const { name, memberUsernames, type } = req.body;
        const creatorId = req.user.id;

        if (type === 'private' && (!memberUsernames || memberUsernames.length !== 1)) {
            return res.status(400).json({ msg: 'Un chat privado debe tener exactamente un otro miembro.' });
        }
        if (type === 'group' && !name) {
            return res.status(400).json({ msg: 'Un chat grupal debe tener un nombre.' });
        }

        try {
            const membersFound = await User.find({ 'username': { $in: memberUsernames } });
            if (membersFound.length !== memberUsernames.length) {
                return res.status(404).json({ msg: 'Uno o más usuarios no fueron encontrados.' });
            }

            const memberIds = membersFound.map(user => user._id);
            const allMemberIds = [...new Set([creatorId, ...memberIds])];

            if (type === 'private') {
                const existingConversation = await Conversation.findOne({
                    type: 'private',
                    members: { $all: allMemberIds, $size: 2 }
                });

                if (existingConversation) {
                    const populatedExisting = await Conversation.findById(existingConversation._id)
                        .populate('members', 'id username');
                    return res.status(200).json(populatedExisting);
                }
            }

            const newConversation = new Conversation({
                name: type === 'group' ? name : null,
                type,
                members: allMemberIds,
                createdBy: creatorId
            });

            await newConversation.save();
            
            const savedConversation = await Conversation.findById(newConversation._id)
                .populate('members', 'id username');

            // Notify all members via socket
            savedConversation.members.forEach(member => {
                io.to(member._id.toString()).emit('newConversation', savedConversation);
            });

            res.status(201).json(savedConversation);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    });

    router.get('/', auth, async (req, res) => {
        try {
            const conversations = await Conversation.find({ members: req.user.id })
                .populate('members', 'username')
                .sort({ updatedAt: -1 });

            res.json(conversations);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Error del servidor');
        }
    });

    return router;
};