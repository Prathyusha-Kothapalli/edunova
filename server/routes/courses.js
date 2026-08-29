const express = require('express');
const { dbPromise } = require('../db/database');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/courses (Catalog with search, filtering, and sorting)
router.get('/', async (req, res, next) => {
  try {
    const { search, category, level, minPrice, maxPrice, rating, sort, featured } = req.query;

    let sql = `SELECT * FROM courses WHERE status = 'published'`;
    const params = [];

    if (search) {
      sql += ` AND (title LIKE ? OR description LIKE ? OR category LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (category && category !== 'All') {
      sql += ` AND category = ?`;
      params.push(category);
    }

    if (level && level !== 'All') {
      sql += ` AND level = ?`;
      params.push(level);
    }

    if (featured === '1' || featured === 'true') {
      sql += ` AND featured = 1`;
    }

    if (rating) {
      sql += ` AND rating >= ?`;
      params.push(parseFloat(rating));
    }

    // Sorting
    if (sort === 'popular') {
      sql += ` ORDER BY students_count DESC`;
    } else if (sort === 'rating') {
      sql += ` ORDER BY rating DESC`;
    } else if (sort === 'price-low') {
      sql += ` ORDER BY price ASC`;
    } else if (sort === 'price-high') {
      sql += ` ORDER BY price DESC`;
    } else {
      sql += ` ORDER BY created_at DESC`;
    }

    const courses = await dbPromise.all(sql, params);

    // Parse JSON strings
    const parsedCourses = courses.map(c => ({
      ...c,
      tags: c.tags ? JSON.parse(c.tags) : [],
      prerequisites: c.prerequisites ? JSON.parse(c.prerequisites) : [],
      learning_outcomes: c.learning_outcomes ? JSON.parse(c.learning_outcomes) : []
    }));

    res.json({ courses: parsedCourses });
  } catch (err) {
    next(err);
  }
});

// GET /api/courses/:id (Course Detail with Modules, Lessons & Quizzes)
router.get('/:id', async (req, res, next) => {
  try {
    const course = await dbPromise.get('SELECT * FROM courses WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    const modules = await dbPromise.all(
      'SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC',
      [course.id]
    );

    const lessons = await dbPromise.all(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC',
      [course.id]
    );

    const quizzes = await dbPromise.all(
      'SELECT id, course_id, title, description, time_limit_mins, pass_percentage FROM quizzes WHERE course_id = ?',
      [course.id]
    );

    // Assemble module structure
    const structuredModules = modules.map(mod => ({
      ...mod,
      lessons: lessons.filter(l => l.module_id === mod.id).map(l => ({
        ...l,
        resources: l.resources ? JSON.parse(l.resources) : []
      })),
      quizzes: quizzes.filter(q => !q.lesson_id)
    }));

    res.json({
      course: {
        ...course,
        tags: course.tags ? JSON.parse(course.tags) : [],
        prerequisites: course.prerequisites ? JSON.parse(course.prerequisites) : [],
        learning_outcomes: course.learning_outcomes ? JSON.parse(course.learning_outcomes) : [],
        modules: structuredModules,
        quizzes
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/courses (Create course - Instructors & Admins)
router.post('/', authenticate, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
  try {
    const { title, subtitle, description, category, level, price, thumbnail, modules } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and Category are required.' });
    }

    const courseId = `crs_${Date.now()}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();

    await dbPromise.run(
      `INSERT INTO courses (id, title, slug, subtitle, description, category, level, thumbnail, instructor_id, instructor_name, price, rating, students_count, lessons_count, duration, status, featured, tags, prerequisites, learning_outcomes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        courseId, title, slug, subtitle || '', description || '', category, level || 'All Levels',
        thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
        req.user.id, req.user.name, parseFloat(price) || 0, 5.0, 0, 8, '4h 00m', 'published', 0,
        JSON.stringify([category, 'New']), JSON.stringify(['Basic understanding']), JSON.stringify(['Master key concepts']), now
      ]
    );

    // Create default module and lessons if provided
    if (modules && Array.isArray(modules)) {
      for (let mIdx = 0; mIdx < modules.length; mIdx++) {
        const mod = modules[mIdx];
        const modId = `mod_${courseId}_${mIdx + 1}`;
        await dbPromise.run(
          `INSERT INTO modules (id, course_id, title, order_index) VALUES (?, ?, ?, ?)`,
          [modId, courseId, mod.title || `Module ${mIdx + 1}`, mIdx + 1]
        );

        if (mod.lessons && Array.isArray(mod.lessons)) {
          for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
            const lsn = mod.lessons[lIdx];
            const lsnId = `lsn_${modId}_${lIdx + 1}`;
            await dbPromise.run(
              `INSERT INTO lessons (id, course_id, module_id, title, duration, video_url, content, order_index, resources)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [lsnId, courseId, modId, lsn.title || `Lesson ${lIdx + 1}`, '12 mins', lsn.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', lsn.content || 'Lesson content overview', lIdx + 1, JSON.stringify([])]
            );
          }
        }
      }
    }

    res.status(201).json({ message: 'Course created successfully', courseId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
