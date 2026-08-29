const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../server/index');

const request = supertest(app);

test('Admin API - Block Non-Admin User Access', async () => {
  const authRes = await request.post('/api/auth/demo-login').send({ role: 'student' });
  const token = authRes.body.token;

  const res = await request
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 403);
});

test('Admin API - Get System Statistics as Admin', async () => {
  const authRes = await request.post('/api/auth/demo-login').send({ role: 'admin' });
  const token = authRes.body.token;

  const res = await request
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.stats);
  assert.ok(res.body.stats.total_users >= 100);
  assert.ok(res.body.stats.courses >= 25);
});

test('Admin API - Suspend and Reactivate User Account', async () => {
  const authRes = await request.post('/api/auth/demo-login').send({ role: 'admin' });
  const token = authRes.body.token;

  const targetUserId = 'usr_std_10';

  // Suspend
  const suspRes = await request
    .put(`/api/admin/users/${targetUserId}/status`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'suspended' });

  assert.strictEqual(suspRes.status, 200);

  // Activate back
  const actRes = await request
    .put(`/api/admin/users/${targetUserId}/status`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'active' });

  assert.strictEqual(actRes.status, 200);
});

test('Admin API - Fetch System Audit Logs', async () => {
  const authRes = await request.post('/api/auth/demo-login').send({ role: 'admin' });
  const token = authRes.body.token;

  const res = await request
    .get('/api/admin/logs')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.logs));
  assert.ok(res.body.logs.length > 0);
});
