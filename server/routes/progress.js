const express = require('express');
const { dbPromise } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/progress/lesson (Toggle lesson completion)
router.post('/lesson', authenticate, async (req, res, next) => {
  try {
    const { course_id, lesson_id, completed } = req.body;
    if (!course_id || !lesson_id) {
      return res.status(400).json({ error: 'course_id and lesson_id are required.' });
    }

    const now = new Date().toISOString();

    if (completed === false) {
      // Remove progress record
      await dbPromise.run(
        'DELETE FROM lesson_progress WHERE user_id = ? AND lesson_id = ?',
        [req.user.id, lesson_id]
      );
    } else {
      // Insert progress record
      await dbPromise.run(
        `INSERT OR IGNORE INTO lesson_progress (id, user_id, course_id, lesson_id, completed_at) VALUES (?, ?, ?, ?, ?)`,
        [`lp_${req.user.id}_${lesson_id}`, req.user.id, course_id, lesson_id, now]
      );
    }

    // Recalculate progress percentage
    const allLessons = await dbPromise.all('SELECT id FROM lessons WHERE course_id = ?', [course_id]);
    const completedLessons = await dbPromise.all(
      'SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = ?',
      [req.user.id, course_id]
    );

    const totalCount = allLessons.length || 1;
    const completedCount = completedLessons.length;
    const progressPct = parseFloat(((completedCount / totalCount) * 100).toFixed(1));

    const isCompleted = progressPct >= 100;

    await dbPromise.run(
      `UPDATE enrollments SET progress_pct = ?, status = ?, completed_at = ? WHERE user_id = ? AND course_id = ?`,
      [progressPct, isCompleted ? 'completed' : 'active', isCompleted ? now : null, req.user.id, course_id]
    );

    // Auto-generate Certificate if 100% completed
    let certificate = null;
    if (isCompleted) {
      const existingCert = await dbPromise.get(
        'SELECT * FROM certificates WHERE user_id = ? AND course_id = ?',
        [req.user.id, course_id]
      );

      if (!existingCert) {
        const user = await dbPromise.get('SELECT name FROM users WHERE id = ?', [req.user.id]);
        const course = await dbPromise.get('SELECT title FROM courses WHERE id = ?', [course_id]);
        const certCode = `EDUNOVA-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        certificate = {
          id: `cert_${Date.now()}`,
          user_id: req.user.id,
          course_id,
          certificate_code: certCode,
          student_name: user ? user.name : 'Student Learner',
          course_title: course ? course.title : 'EduNova Course',
          issued_at: now
        };

        await dbPromise.run(
          `INSERT INTO certificates (id, user_id, course_id, certificate_code, student_name, course_title, issued_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [certificate.id, certificate.user_id, certificate.course_id, certificate.certificate_code, certificate.student_name, certificate.course_title, certificate.issued_at]
        );
      } else {
        certificate = existingCert;
      }
    }

    res.json({
      progress_pct: progressPct,
      completed_count: completedCount,
      total_count: totalCount,
      is_completed: isCompleted,
      certificate
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
