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

router.get('/list', auth, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');

        if (!users || users.length === 0) {
            return res.status(404).json({ msg: 'No hay otros usuarios' });
        }

        res.json(users);

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error del servidor' });
    }
});

module.exports = router;
