const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const CHUCK_API_URL = 'https://api.chucknorris.io';
const LIBRETRANSLATE_API_URL = 'http://localhost:5001';

// @route   GET api/chuck/categories
// @desc    Fetch joke categories from Chuck Norris API
// @access  Public
router.get('/chuck/categories', async (req, res) => {
    try {
        const response = await fetch(`${CHUCK_API_URL}/jokes/categories`);
        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/chuck/joke/:category
// @desc    Fetch a random joke from a category from Chuck Norris API
// @access  Public
router.get('/chuck/joke/:category', async (req, res) => {
    const { category } = req.params;
    try {
        const response = await fetch(`${CHUCK_API_URL}/jokes/random?category=${category}`);
        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/translate
// @desc    Translate text using LibreTranslate API
// @access  Public
router.post('/translate', async (req, res) => {
    const { q, source, target } = req.body;

    if (!q || !source || !target) {
        return res.status(400).json({ msg: 'Please provide text, source and target language' });
    }

    try {
        const response = await fetch(`${LIBRETRANSLATE_API_URL}/translate`, {
            method: 'POST',
            body: JSON.stringify({ q, source, target, format: 'text' }),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('LibreTranslate API error:', data);
            return res.status(response.status).json({ msg: 'Error from translation service', details: data });
        }

        res.json(data);
    } catch (err) {
        console.error('Proxy to LibreTranslate failed:', err.message);
        res.status(500).send('Server Error while translating');
    }
});

module.exports = router;
