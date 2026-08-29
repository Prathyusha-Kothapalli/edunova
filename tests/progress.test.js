const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../server/index');

const request = supertest(app);

test('Progress API - Toggle Lesson Completion & Recalculate Course Progress %', async () => {
  const authRes = await request.post('/api/auth/demo-login').send({ role: 'student' });
  const token = authRes.body.token;

  // Mark lesson as complete
  const res = await request
    .post('/api/progress/lesson')
    .set('Authorization', `Bearer ${token}`)
    .send({
      course_id: 'crs_2',
      lesson_id: 'lsn_2_1_1',
      completed: true
    });

  assert.strictEqual(res.status, 200);
  assert.ok(typeof res.body.progress_pct === 'number');
  assert.ok(res.body.completed_count >= 1);
});

test('Progress API - Auto-issue Certificate on 100% Course Progress', async () => {
  const authRes = await request.post('/api/auth/demo-login').send({ role: 'student' });
  const token = authRes.body.token;

  // Complete all 8 lessons of crs_3
  for (let m = 1; m <= 2; m++) {
    for (let l = 1; l <= 4; l++) {
      await request
        .post('/api/progress/lesson')
        .set('Authorization', `Bearer ${token}`)
        .send({
          course_id: 'crs_3',
          lesson_id: `lsn_3_${m}_${l}`,
          completed: true
        });
    }
  }

  const finalRes = await request
    .get('/api/enrollments/crs_3/progress')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(finalRes.status, 200);
  assert.strictEqual(finalRes.body.progress_pct, 100);
  assert.ok(finalRes.body.certificate, 'Certificate should be auto-issued when 100% completed');
  assert.ok(finalRes.body.certificate.certificate_code.includes('EDUNOVA-CERT'));
});
