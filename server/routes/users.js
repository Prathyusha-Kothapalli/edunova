const express = require('express');
const { dbPromise } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await dbPromise.get(
      'SELECT id, email, name, role, avatar, bio, title, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/profile (Update name, bio, title, avatar)
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, bio, title, avatar } = req.body;
    const user = await dbPromise.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

    const updatedName = name || user.name;
    const updatedBio = bio !== undefined ? bio : user.bio;
    const updatedTitle = title !== undefined ? title : user.title;
    const updatedAvatar = avatar || user.avatar;

    await dbPromise.run(
      `UPDATE users SET name = ?, bio = ?, title = ?, avatar = ? WHERE id = ?`,
      [updatedName, updatedBio, updatedTitle, updatedAvatar, req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user.id,
        email: user.email,
        name: updatedName,
        role: user.role,
        avatar: updatedAvatar,
        bio: updatedBio,
        title: updatedTitle
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
