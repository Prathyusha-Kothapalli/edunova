const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../server/index');

const request = supertest(app);

test('Quizzes API - Fetch Quiz Details & Questions', async () => {
  // First obtain student token
  const authRes = await request.post('/api/auth/demo-login').send({ role: 'student' });
  const token = authRes.body.token;

  const res = await request
    .get('/api/quizzes/qz_1_1')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.quiz);
  assert.strictEqual(res.body.quiz.id, 'qz_1_1');
  assert.ok(Array.isArray(res.body.quiz.questions));
  assert.strictEqual(res.body.quiz.questions.length, 3);
});

test('Quizzes API - Submit Answers and Calculate Score', async () => {
  const authRes = await request.post('/api/auth/demo-login').send({ role: 'student' });
  const token = authRes.body.token;

  const res = await request
    .post('/api/quizzes/qz_1_1/submit')
    .set('Authorization', `Bearer ${token}`)
    .send({
      answers: {
        'qq_qz_1_1_1': 0,
        'qq_qz_1_1_2': 1,
        'qq_qz_1_1_3': 1
      }
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.score, 100);
  assert.strictEqual(res.body.passed, true);
  assert.ok(Array.isArray(res.body.review));
  assert.strictEqual(res.body.review.length, 3);
});
