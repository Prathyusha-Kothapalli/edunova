const express = require('express');
const { dbPromise } = require('../db/database');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Require Admin Role for all endpoints in this router
router.use(authenticate, authorizeRoles('admin'));

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const { search, role, status } = req.query;
    let sql = `SELECT id, email, name, role, avatar, bio, title, status, created_at FROM users WHERE 1=1`;
    const params = [];

    if (search) {
      sql += ` AND (name LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role && role !== 'All') {
      sql += ` AND role = ?`;
      params.push(role);
    }

    if (status && status !== 'All') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC`;
    const users = await dbPromise.all(sql, params);

    res.json({ users, total: users.length });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id/status (Suspend or Activate User)
router.put('/users/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body; // 'active' or 'suspended'
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or suspended.' });
    }

    await dbPromise.run('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);

    // Audit log
    await dbPromise.run(
      `INSERT INTO audit_logs (id, user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [`log_${Date.now()}`, req.user.id, 'USER_STATUS_CHANGE', `Changed user ${req.params.id} status to ${status}`, req.ip, new Date().toISOString()]
    );

    res.json({ message: `User status updated to ${status}` });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id/role (Change User Role)
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be student, instructor, or admin.' });
    }

    await dbPromise.run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);

    // Audit log
    await dbPromise.run(
      `INSERT INTO audit_logs (id, user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [`log_${Date.now()}`, req.user.id, 'USER_ROLE_CHANGE', `Changed user ${req.params.id} role to ${role}`, req.ip, new Date().toISOString()]
    );

    res.json({ message: `User role updated to ${role}` });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const totalUsersRow = await dbPromise.get('SELECT COUNT(*) as count FROM users');
    const studentsRow = await dbPromise.get("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const instructorsRow = await dbPromise.get("SELECT COUNT(*) as count FROM users WHERE role = 'instructor'");
    const coursesRow = await dbPromise.get('SELECT COUNT(*) as count FROM courses');
    const enrollmentsRow = await dbPromise.get('SELECT COUNT(*) as count FROM enrollments');
    const certificatesRow = await dbPromise.get('SELECT COUNT(*) as count FROM certificates');

    res.json({
      stats: {
        total_users: totalUsersRow.count,
        students: studentsRow.count,
        instructors: instructorsRow.count,
        courses: coursesRow.count,
        enrollments: enrollmentsRow.count,
        certificates_issued: certificatesRow.count
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/logs
router.get('/logs', async (req, res, next) => {
  try {
    const logs = await dbPromise.all(
      `SELECT log.*, u.name as user_name, u.email as user_email
       FROM audit_logs log
       LEFT JOIN users u ON log.user_id = u.id
       ORDER BY log.created_at DESC
       LIMIT 50`
    );

    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
