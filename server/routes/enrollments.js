const express = require('express');
const { dbPromise } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/enrollments (Get user's enrolled courses with progress)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const enrollments = await dbPromise.all(
      `SELECT e.*, c.title as course_title, c.thumbnail, c.category, c.instructor_name, c.lessons_count, c.duration
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = ?
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );

    res.json({ enrollments });
  } catch (err) {
    next(err);
  }
});

// POST /api/enrollments (Enroll student in a course)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { course_id } = req.body;
    if (!course_id) {
      return res.status(400).json({ error: 'course_id is required.' });
    }

    const course = await dbPromise.get('SELECT * FROM courses WHERE id = ?', [course_id]);
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    const existing = await dbPromise.get(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [req.user.id, course_id]
    );

    if (existing) {
      return res.status(400).json({ error: 'Already enrolled in this course.' });
    }

    const enrollmentId = `enr_${Date.now()}`;
    const now = new Date().toISOString();

    await dbPromise.run(
      `INSERT INTO enrollments (id, user_id, course_id, enrolled_at, progress_pct, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [enrollmentId, req.user.id, course_id, now, 0.0, 'active']
    );

    // Update students count
    await dbPromise.run('UPDATE courses SET students_count = students_count + 1 WHERE id = ?', [course_id]);

    res.status(201).json({ message: 'Successfully enrolled!', enrollmentId });
  } catch (err) {
    next(err);
  }
});

// GET /api/enrollments/:courseId/progress
router.get('/:courseId/progress', authenticate, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const enrollment = await dbPromise.get(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [req.user.id, courseId]
    );

    const completedLessons = await dbPromise.all(
      'SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = ?',
      [req.user.id, courseId]
    );

    const certificate = await dbPromise.get(
      'SELECT * FROM certificates WHERE user_id = ? AND course_id = ?',
      [req.user.id, courseId]
    );

    res.json({
      enrolled: !!enrollment,
      progress_pct: enrollment ? enrollment.progress_pct : 0,
      completed_lesson_ids: completedLessons.map(l => l.lesson_id),
      certificate: certificate || null
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
