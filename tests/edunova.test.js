const ProgressTracker = require('../public/js/progressTracker');
const QuizEngine = require('../public/js/quizEngine');
const CertificateGenerator = require('../public/js/certificateGenerator');

describe('EduNova Unit Tests', () => {
    test('ProgressTracker calculates percentage', () => {
        expect(ProgressTracker.calculateProgress(3, 4)).toBe(75);
    });

    test('QuizEngine grades quiz correctly', () => {
        const questions = [{ correctOptionIndex: 1 }, { correctOptionIndex: 0 }];
        const res = QuizEngine.gradeQuiz(questions, [1, 0]);
        expect(res.score).toBe(100);
        expect(res.passed).toBe(true);
    });

    test('CertificateGenerator creates valid cert', () => {
        const cert = CertificateGenerator.generateCertificate('Alice', 'Python 101');
        expect(cert.studentName).toBe('Alice');
    });
});