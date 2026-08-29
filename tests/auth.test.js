const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../server/index');

const request = supertest(app);

test('Auth API - Demo Login as Student', async () => {
  const res = await request
    .post('/api/auth/demo-login')
    .send({ role: 'student' });

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.token, 'Token should be returned');
  assert.strictEqual(res.body.user.role, 'student');
  assert.strictEqual(res.body.user.email, 'student@edunova.com');
});

test('Auth API - Demo Login as Instructor', async () => {
  const res = await request
    .post('/api/auth/demo-login')
    .send({ role: 'instructor' });

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.token);
  assert.strictEqual(res.body.user.role, 'instructor');
});

test('Auth API - Demo Login as Admin', async () => {
  const res = await request
    .post('/api/auth/demo-login')
    .send({ role: 'admin' });

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.token);
  assert.strictEqual(res.body.user.role, 'admin');
});

test('Auth API - Register New User', async () => {
  const testEmail = `test_user_${Date.now()}@edunova.com`;
  const res = await request
    .post('/api/auth/register')
    .send({
      name: 'Test Student',
      email: testEmail,
      password: 'TestPassword@123',
      role: 'student'
    });

  assert.strictEqual(res.status, 201);
  assert.ok(res.body.token);
  assert.strictEqual(res.body.user.email, testEmail);
});

test('Auth API - Reject Invalid Credentials', async () => {
  const res = await request
    .post('/api/auth/login')
    .send({
      email: 'student@edunova.com',
      password: 'WrongPassword'
    });

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.error, 'Invalid credentials.');
});
