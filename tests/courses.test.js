const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../server/index');

const request = supertest(app);

test('Courses API - List All Published Courses', async () => {
  const res = await request.get('/api/courses');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.courses));
  assert.ok(res.body.courses.length >= 25, 'Should return at least 25 seeded courses');
});

test('Courses API - Filter Courses by Category', async () => {
  const res = await request.get('/api/courses?category=Web%20Development');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.courses.length > 0);
  res.body.courses.forEach(c => {
    assert.strictEqual(c.category, 'Web Development');
  });
});

test('Courses API - Search Courses by Keyword', async () => {
  const res = await request.get('/api/courses?search=React');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.courses.length > 0);
  assert.ok(res.body.courses[0].title.includes('React'));
});

test('Courses API - Get Single Course Detail with Modules & Lessons', async () => {
  const res = await request.get('/api/courses/crs_1');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.course);
  assert.strictEqual(res.body.course.id, 'crs_1');
  assert.ok(Array.isArray(res.body.course.modules));
  assert.ok(res.body.course.modules.length > 0);
});
