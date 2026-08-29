const express = require('express');
const { dbPromise } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/dashboard
router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'student') {
      const enrollments = await dbPromise.all(
        'SELECT * FROM enrollments WHERE user_id = ?',
        [userId]
      );
      const completedCerts = await dbPromise.all(
        'SELECT * FROM certificates WHERE user_id = ?',
        [userId]
      );
      const quizSubmissions = await dbPromise.all(
        'SELECT * FROM quiz_submissions WHERE user_id = ?',
        [userId]
      );

      const totalEnrolled = enrollments.length;
      const completedCourses = enrollments.filter(e => e.status === 'completed').length;
      const avgProgress = totalEnrolled > 0
        ? parseFloat((enrollments.reduce((acc, curr) => acc + curr.progress_pct, 0) / totalEnrolled).toFixed(1))
        : 0;

      const totalQuizzesTaken = quizSubmissions.length;
      const passedQuizzes = quizSubmissions.filter(q => q.passed === 1).length;

      return res.json({
        role: 'student',
        analytics: {
          total_enrolled: totalEnrolled,
          completed_courses: completedCourses,
          certificates_earned: completedCerts.length,
          avg_progress_pct: avgProgress,
          quizzes_taken: totalQuizzesTaken,
          quizzes_passed: passedQuizzes,
          streak_days: 7
        }
      });
    }

    if (userRole === 'instructor') {
      const courses = await dbPromise.all(
        'SELECT id, title, students_count, rating, price FROM courses WHERE instructor_id = ?',
        [userId]
      );

      const totalCourses = courses.length;
      const totalStudents = courses.reduce((acc, c) => acc + c.students_count, 0);
      const avgRating = totalCourses > 0
        ? parseFloat((courses.reduce((acc, c) => acc + c.rating, 0) / totalCourses).toFixed(1))
        : 5.0;
      const estimatedRevenue = courses.reduce((acc, c) => acc + (c.price * c.students_count), 0);

      return res.json({
        role: 'instructor',
        analytics: {
          total_courses: totalCourses,
          total_students: totalStudents,
          avg_rating: avgRating,
          estimated_revenue: parseFloat(estimatedRevenue.toFixed(2)),
          courses
        }
      });
    }

    // Default admin analytics summary
    const usersCount = await dbPromise.get('SELECT COUNT(*) as c FROM users');
    const coursesCount = await dbPromise.get('SELECT COUNT(*) as c FROM courses');
    const enrollmentsCount = await dbPromise.get('SELECT COUNT(*) as c FROM enrollments');
    const certsCount = await dbPromise.get('SELECT COUNT(*) as c FROM certificates');

    res.json({
      role: 'admin',
      analytics: {
        total_users: usersCount.c,
        total_courses: coursesCount.c,
        total_enrollments: enrollmentsCount.c,
        certificates_issued: certsCount.c
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
