const express = require('express');
const { dbPromise } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/quizzes/:quizId (Get Quiz details & questions - sans correct answers if student taking quiz)
router.get('/:quizId', authenticate, async (req, res, next) => {
  try {
    const quiz = await dbPromise.get('SELECT * FROM quizzes WHERE id = ?', [req.params.quizId]);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    const questions = await dbPromise.all(
      'SELECT id, quiz_id, question_text, options FROM quiz_questions WHERE quiz_id = ?',
      [req.params.quizId]
    );

    const formattedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }));

    res.json({
      quiz: {
        ...quiz,
        questions: formattedQuestions
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/quizzes/:quizId/submit (Submit & grade quiz)
router.post('/:quizId/submit', authenticate, async (req, res, next) => {
  try {
    const { answers } = req.body; // { question_id: option_index }
    if (!answers) {
      return res.status(400).json({ error: 'Answers object is required.' });
    }

    const quiz = await dbPromise.get('SELECT * FROM quizzes WHERE id = ?', [req.params.quizId]);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    const questions = await dbPromise.all(
      'SELECT * FROM quiz_questions WHERE quiz_id = ?',
      [req.params.quizId]
    );

    let correctCount = 0;
    const review = [];

    questions.forEach(q => {
      const selectedOpt = answers[q.id];
      const isCorrect = parseInt(selectedOpt, 10) === q.correct_option;
      if (isCorrect) correctCount++;

      review.push({
        question_id: q.id,
        question_text: q.question_text,
        options: JSON.parse(q.options),
        selected_option: selectedOpt,
        correct_option: q.correct_option,
        is_correct: isCorrect,
        explanation: q.explanation
      });
    });

    const score = parseFloat(((correctCount / questions.length) * 100).toFixed(1));
    const passed = score >= quiz.pass_percentage ? 1 : 0;
    const submissionId = `qs_${Date.now()}`;
    const now = new Date().toISOString();

    await dbPromise.run(
      `INSERT INTO quiz_submissions (id, user_id, quiz_id, course_id, score, passed, answers, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [submissionId, req.user.id, quiz.id, quiz.course_id, score, passed, JSON.stringify(answers), now]
    );

    res.json({
      submission_id: submissionId,
      score,
      passed: !!passed,
      pass_percentage: quiz.pass_percentage,
      correct_count: correctCount,
      total_questions: questions.length,
      review
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
