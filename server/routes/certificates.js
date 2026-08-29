const express = require('express');
const { dbPromise } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/certificates (User's certificates)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const certs = await dbPromise.all(
      `SELECT cert.*, c.thumbnail, c.category, c.instructor_name
       FROM certificates cert
       JOIN courses c ON cert.course_id = c.id
       WHERE cert.user_id = ?
       ORDER BY cert.issued_at DESC`,
      [req.user.id]
    );

    res.json({ certificates: certs });
  } catch (err) {
    next(err);
  }
});

// GET /api/certificates/:code (Public verification endpoint)
router.get('/:code', async (req, res, next) => {
  try {
    const cert = await dbPromise.get(
      `SELECT cert.*, c.thumbnail, c.category, c.instructor_name, c.duration
       FROM certificates cert
       JOIN courses c ON cert.course_id = c.id
       WHERE cert.certificate_code = ? OR cert.id = ?`,
      [req.params.code, req.params.code]
    );

    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found or invalid verification code.' });
    }

    res.json({ certificate: cert, verified: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
