const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ msg: 'Por favor, introduce todos los campos' });
        }

        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        user = new User({
            username,
            password
        });

        await user.save();

        res.status(201).json({ user });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ msg: 'Por favor, introduce todos los campos' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Credenciales no válidas' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales no válidas' });
        }

        // Add login time to session history
        user.sessionHistory.push({ loginTime: new Date() });
        await user.save();

        const payload = {
            user: {
                id: user.id,
                username: user.username // Add username to the payload
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   POST api/auth/logout
// @desc    Log user out and record logout time
// @access  Private
router.post('/logout', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const lastSession = user.sessionHistory.slice(-1)[0];
        if (lastSession && !lastSession.logoutTime) {
            lastSession.logoutTime = new Date();
            await user.save();
        }

        res.json({ msg: 'Logout successful' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
