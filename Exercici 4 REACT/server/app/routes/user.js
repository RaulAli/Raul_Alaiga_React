const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/user/activity
// @desc    Log a viewed joke
// @access  Private
router.post('/activity', auth, async (req, res) => {
    const { category, joke } = req.body;

    if (!category || !joke) {
        return res.status(400).json({ msg: 'Category and joke are required' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.viewedJokes.has(category)) {
            const jokes = user.viewedJokes.get(category);
            if (!jokes.includes(joke)) {
                jokes.push(joke);
                user.viewedJokes.set(category, jokes);
            }
        } else {
            user.viewedJokes.set(category, [joke]);
        }
        
        await user.save();

        res.json({ msg: 'Activity logged successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
