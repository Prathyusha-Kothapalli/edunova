const bcrypt = require('bcryptjs');
const { dbPromise, initDatabase } = require('./database');

async function seed() {
  console.log('🌱 Initializing EduNova Database Seeder...');
  await initDatabase();

  const passwordHash = bcrypt.hashSync('Demo@123', 8);
  const now = new Date().toISOString();

  // Clear existing data
  await dbPromise.exec(`
    DELETE FROM audit_logs;
    DELETE FROM notifications;
    DELETE FROM certificates;
    DELETE FROM quiz_submissions;
    DELETE FROM lesson_progress;
    DELETE FROM enrollments;
    DELETE FROM quiz_questions;
    DELETE FROM quizzes;
    DELETE FROM lessons;
    DELETE FROM modules;
    DELETE FROM courses;
    DELETE FROM users;
  `);

  console.log('🧹 Existing tables cleared.');

  // 1. Create Core Users (3 Main Demo Accounts + 10 Instructors + 100 Students)
  const users = [
    {
      id: 'usr_student_demo',
      email: 'student@edunova.com',
      password_hash: passwordHash,
      name: 'Alex Rivera',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Full-stack software engineering student passionate about cloud architectures and AI.',
      title: 'Computer Science Scholar',
      status: 'active',
      created_at: now
    },
    {
      id: 'usr_instructor_demo',
      email: 'instructor@edunova.com',
      password_hash: passwordHash,
      name: 'Dr. Sarah Jenkins',
      role: 'instructor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      bio: 'Senior Principal Engineer & AI Researcher with 14+ years of industry experience at top tier tech firms.',
      title: 'Principal AI Architect & Course Director',
      status: 'active',
      created_at: now
    },
    {
      id: 'usr_admin_demo',
      email: 'admin@edunova.com',
      password_hash: passwordHash,
      name: 'Marcus Vance',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'EduNova Lead Administrator managing platform infrastructure, security, and course quality standards.',
      title: 'Chief Platform Administrator',
      status: 'active',
      created_at: now
    }
  ];

  // 10 Instructors
  const instructorNames = [
    'Elena Rostova', 'David Chen', 'Prof. Alan Vance', 'Sophia Martinez',
    'Liam O\'Connor', 'Priya Sharma', 'Marcus Sterling', 'Hannah Schmidt',
    'Julian Thorne', 'Amara Okafor'
  ];

  for (let i = 1; i <= 10; i++) {
    users.push({
      id: `usr_inst_${i}`,
      email: `instructor${i}@edunova.com`,
      password_hash: passwordHash,
      name: instructorNames[i - 1],
      role: 'instructor',
      avatar: `https://i.pravatar.cc/150?u=instructor_${i}`,
      bio: `Industry specialist with expertise in course module design and technical mentorship.`,
      title: `Senior Tech Lead & Educator`,
      status: 'active',
      created_at: now
    });
  }

  // 100 Students
  for (let i = 1; i <= 100; i++) {
    users.push({
      id: `usr_std_${i}`,
      email: `student${i}@edunova.com`,
      password_hash: passwordHash,
      name: `Student User ${i}`,
      role: 'student',
      avatar: `https://i.pravatar.cc/150?u=student_${i}`,
      bio: `Passionate learner building skills in software development and technology.`,
      title: `Enrolled Learner`,
      status: i % 25 === 0 ? 'suspended' : 'active',
      created_at: now
    });
  }

  for (const user of users) {
    await dbPromise.run(
      `INSERT INTO users (id, email, password_hash, name, role, avatar, bio, title, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.email, user.password_hash, user.name, user.role, user.avatar, user.bio, user.title, user.status, user.created_at]
    );
  }
  console.log(`✅ Seeded ${users.length} Users (Students, Instructors, Admin).`);

  // 2. Seed 26 Courses
  const categories = [
    'Web Development', 'Data Science & AI', 'UI/UX Design',
    'Cloud Computing', 'Cybersecurity', 'Business & Marketing'
  ];

  const courseSpecs = [
    { title: 'Full-Stack Modern React & Node.js Masterclass', category: 'Web Development', level: 'Intermediate', price: 89.99, featured: 1 },
    { title: 'Applied Generative AI & LLM Engineering', category: 'Data Science & AI', level: 'Advanced', price: 119.99, featured: 1 },
    { title: 'UI/UX System Design & Figma Prototyping', category: 'UI/UX Design', level: 'Beginner', price: 49.99, featured: 1 },
    { title: 'AWS Cloud Solutions Architect Certification', category: 'Cloud Computing', level: 'Intermediate', price: 99.99, featured: 1 },
    { title: 'Ethical Hacking & Penetration Testing Core', category: 'Cybersecurity', level: 'Advanced', price: 109.99, featured: 1 },
    { title: 'Digital Product Management & Growth Strategy', category: 'Business & Marketing', level: 'Beginner', price: 59.99, featured: 0 },
    { title: 'Python for Data Analysis & Visualization', category: 'Data Science & AI', level: 'Beginner', price: 69.99, featured: 1 },
    { title: 'Docker, Kubernetes & DevOps Pipeline Mastery', category: 'Cloud Computing', level: 'Advanced', price: 129.99, featured: 1 },
    { title: 'Vue 3 & Nuxt 3 Full-Stack Enterprise Apps', category: 'Web Development', level: 'Intermediate', price: 79.99, featured: 0 },
    { title: 'Deep Learning & Neural Networks with PyTorch', category: 'Data Science & AI', level: 'Advanced', price: 139.99, featured: 0 },
    { title: 'Advanced CSS Grid, Flexbox & Web Animations', category: 'Web Development', level: 'Beginner', price: 39.99, featured: 0 },
    { title: 'TypeScript for Large Scale Frontend Applications', category: 'Web Development', level: 'Intermediate', price: 74.99, featured: 0 },
    { title: 'Microservices Architecture with Go & gRPC', category: 'Web Development', level: 'Advanced', price: 114.99, featured: 0 },
    { title: 'Network Security Fundamentals & Defense', category: 'Cybersecurity', level: 'Beginner', price: 64.99, featured: 0 },
    { title: 'Mobile App Development with Flutter & Dart', category: 'Web Development', level: 'Intermediate', price: 84.99, featured: 0 },
    { title: 'SQL & Relational Database Design Bootcamp', category: 'Data Science & AI', level: 'Beginner', price: 44.99, featured: 0 },
    { title: 'Design Thinking & Human-Centered UX Research', category: 'UI/UX Design', level: 'Intermediate', price: 54.99, featured: 0 },
    { title: 'Google Cloud Platform (GCP) Infrastructure', category: 'Cloud Computing', level: 'Intermediate', price: 94.99, featured: 0 },
    { title: 'Cyber Threat Intelligence & Incident Response', category: 'Cybersecurity', level: 'Advanced', price: 119.99, featured: 0 },
    { title: 'SEO, Content Strategy & Inbound Marketing', category: 'Business & Marketing', level: 'Beginner', price: 34.99, featured: 0 },
    { title: 'GraphQL API Design with Apollo & Express', category: 'Web Development', level: 'Intermediate', price: 69.99, featured: 0 },
    { title: 'Machine Learning Models Deployment with MLOps', category: 'Data Science & AI', level: 'Advanced', price: 124.99, featured: 0 },
    { title: 'Clean Code Architecture & Design Patterns', category: 'Web Development', level: 'All Levels', price: 79.99, featured: 0 },
    { title: 'Agile Scrum Master Certification Guide', category: 'Business & Marketing', level: 'Beginner', price: 49.99, featured: 0 },
    { title: 'Interactive WebGL & Three.js 3D Graphics', category: 'Web Development', level: 'Advanced', price: 99.99, featured: 0 },
    { title: 'Zero Trust Cloud Architecture & Compliance', category: 'Cybersecurity', level: 'Advanced', price: 134.99, featured: 0 }
  ];

  const courses = [];
  const modules = [];
  const lessons = [];
  const quizzes = [];
  const quizQuestions = [];

  let totalLessonCount = 0;
  let totalQuizCount = 0;

  for (let cIdx = 0; cIdx < courseSpecs.length; cIdx++) {
    const spec = courseSpecs[cIdx];
    const courseId = `crs_${cIdx + 1}`;
    const slug = spec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const instructor = users[1 + (cIdx % 10)]; // Rotate among instructors

    courses.push({
      id: courseId,
      title: spec.title,
      slug,
      subtitle: `Master ${spec.title} with hands-on projects and industry standard practices.`,
      description: `Comprehensive multi-module course covering practical tools, architectural principles, real-world case studies, and guided exercises. Designed to take your skills to a professional tier.`,
      category: spec.category,
      level: spec.level,
      thumbnail: `https://images.unsplash.com/photo-${1515879218367 + (cIdx * 10000)}?w=600&auto=format&fit=crop&q=80`,
      instructor_id: instructor.id,
      instructor_name: instructor.name,
      price: spec.price,
      rating: parseFloat((4.5 + (cIdx % 5) * 0.1).toFixed(1)),
      students_count: 150 + cIdx * 34,
      lessons_count: 8, // 8 lessons per course = 208 total lessons across 26 courses!
      duration: `${4 + (cIdx % 6)}h ${15 + (cIdx * 5) % 45}m`,
      status: 'published',
      featured: spec.featured,
      tags: JSON.stringify([spec.category, spec.level, 'Certification', 'Projects']),
      prerequisites: JSON.stringify(['Basic computer literacy', 'Enthusiasm to learn']),
      learning_outcomes: JSON.stringify([
        `Build real-world production projects with ${spec.title}`,
        'Understand enterprise best practices and scalable architecture',
        'Gain confidence in technical interviews and code audits'
      ]),
      created_at: now
    });

    // 2 Modules per Course
    for (let mIdx = 1; mIdx <= 2; mIdx++) {
      const moduleId = `mod_${cIdx + 1}_${mIdx}`;
      modules.push({
        id: moduleId,
        course_id: courseId,
        title: mIdx === 1 ? 'Module 1: Core Fundamentals & Environment Setup' : 'Module 2: Advanced Architecture & Production Deployment',
        order_index: mIdx
      });

      // 4 Lessons per Module = 8 Lessons per course
      for (let lIdx = 1; lIdx <= 4; lIdx++) {
        totalLessonCount++;
        const lessonId = `lsn_${cIdx + 1}_${mIdx}_${lIdx}`;
        lessons.push({
          id: lessonId,
          course_id: courseId,
          module_id: moduleId,
          title: `Lesson ${(mIdx - 1) * 4 + lIdx}: ${mIdx === 1 ? 'Foundations & Key Concepts' : 'Applied Techniques'} Part ${lIdx}`,
          duration: `${10 + (lIdx * 3)} mins`,
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          content: `In this lesson, we delve into key principles of ${spec.title}. Follow along with the provided code snippets and architectural diagrams to cement your understanding.`,
          order_index: (mIdx - 1) * 4 + lIdx,
          resources: JSON.stringify([
            { title: 'Lesson Slides (PDF)', url: '#' },
            { title: 'Source Code Repository', url: '#' }
          ])
        });
      }

      // 1 Quiz per Module = 2 Quizzes per course = 52 total quizzes!
      totalQuizCount++;
      const quizId = `qz_${cIdx + 1}_${mIdx}`;
      quizzes.push({
        id: quizId,
        course_id: courseId,
        lesson_id: null,
        title: `Module ${mIdx} Knowledge Assessment: ${spec.title}`,
        description: `Test your mastery of concepts covered in Module ${mIdx}. Passing score is 70%.`,
        time_limit_mins: 10,
        pass_percentage: 70
      });

      // 3 Questions per Quiz = 156 total questions!
      const questionsData = [
        {
          q: `What is a core benefit of using modern patterns in ${spec.title}?`,
          opts: ['Enhanced scalability & maintainability', 'Increased file size', 'Requires manual compilation', 'Disables browser caching'],
          correct: 0,
          exp: 'Modern patterns optimize modular code structure, state separation, and maintainability.'
        },
        {
          q: `Which of the following is considered an enterprise best practice?`,
          opts: ['Storing API secrets in git repo', 'Strict type safety & automated testing', 'Ignoring error handling', 'Writing monolithic 5000-line files'],
          correct: 1,
          exp: 'Automated testing and type discipline reduce production regressions significantly.'
        },
        {
          q: `How should exception handling be structured in async workflows?`,
          opts: ['Ignore errors silently', 'Use try/catch blocks with centralized log synthesis', 'Restart the server manually', 'Delete the error logs'],
          correct: 1,
          exp: 'Centralized exception handling ensures failures are captured and handled gracefully.'
        }
      ];

      questionsData.forEach((qItem, qIdx) => {
        quizQuestions.push({
          id: `qq_${quizId}_${qIdx + 1}`,
          quiz_id: quizId,
          question_text: qItem.q,
          options: JSON.stringify(qItem.opts),
          correct_option: qItem.correct,
          explanation: qItem.exp
        });
      });
    }
  }

  // Insert Courses
  for (const c of courses) {
    await dbPromise.run(
      `INSERT INTO courses (id, title, slug, subtitle, description, category, level, thumbnail, instructor_id, instructor_name, price, rating, students_count, lessons_count, duration, status, featured, tags, prerequisites, learning_outcomes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.title, c.slug, c.subtitle, c.description, c.category, c.level, c.thumbnail, c.instructor_id, c.instructor_name, c.price, c.rating, c.students_count, c.lessons_count, c.duration, c.status, c.featured, c.tags, c.prerequisites, c.learning_outcomes, c.created_at]
    );
  }

  // Insert Modules
  for (const m of modules) {
    await dbPromise.run(
      `INSERT INTO modules (id, course_id, title, order_index) VALUES (?, ?, ?, ?)`,
      [m.id, m.course_id, m.title, m.order_index]
    );
  }

  // Insert Lessons
  for (const l of lessons) {
    await dbPromise.run(
      `INSERT INTO lessons (id, course_id, module_id, title, duration, video_url, content, order_index, resources) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [l.id, l.course_id, l.module_id, l.title, l.duration, l.video_url, l.content, l.order_index, l.resources]
    );
  }

  // Insert Quizzes
  for (const q of quizzes) {
    await dbPromise.run(
      `INSERT INTO quizzes (id, course_id, lesson_id, title, description, time_limit_mins, pass_percentage) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [q.id, q.course_id, q.lesson_id, q.title, q.description, q.time_limit_mins, q.pass_percentage]
    );
  }

  // Insert Quiz Questions
  for (const qq of quizQuestions) {
    await dbPromise.run(
      `INSERT INTO quiz_questions (id, quiz_id, question_text, options, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?)`,
      [qq.id, qq.quiz_id, qq.question_text, qq.options, qq.correct_option, qq.explanation]
    );
  }

  console.log(`✅ Seeded ${courses.length} Courses, ${modules.length} Modules, ${lessons.length} Lessons, ${quizzes.length} Quizzes & ${quizQuestions.length} Questions.`);

  // 3. Seed Enrollments, Lesson Progress, Certificates & Quiz Submissions for Demo Student & Seeded Students
  const enrollments = [];
  const lessonProgress = [];
  const certificates = [];
  const quizSubmissions = [];
  const notifications = [];
  const auditLogs = [];

  // Enroll demo student in top 4 courses
  const demoStudentId = 'usr_student_demo';
  const enrolledCourseIds = ['crs_1', 'crs_2', 'crs_3', 'crs_4'];

  for (let i = 0; i < enrolledCourseIds.length; i++) {
    const courseId = enrolledCourseIds[i];
    const isCompleted = i === 0; // Course 1 is 100% completed for instant certificate viewing!
    const progressPct = isCompleted ? 100 : (i === 1 ? 62.5 : 25.0);

    enrollments.push({
      id: `enr_demo_${courseId}`,
      user_id: demoStudentId,
      course_id: courseId,
      enrolled_at: now,
      progress_pct: progressPct,
      status: isCompleted ? 'completed' : 'active',
      completed_at: isCompleted ? now : null
    });

    // Seed completed lessons for enrolled courses
    const courseLessons = lessons.filter(l => l.course_id === courseId);
    const completedCount = Math.round((progressPct / 100) * courseLessons.length);

    for (let k = 0; k < completedCount; k++) {
      lessonProgress.push({
        id: `lp_demo_${courseLessons[k].id}`,
        user_id: demoStudentId,
        course_id: courseId,
        lesson_id: courseLessons[k].id,
        completed_at: now
      });
    }

    // Seed completed quiz for completed course
    if (isCompleted) {
      const courseQuizzes = quizzes.filter(q => q.course_id === courseId);
      for (const q of courseQuizzes) {
        quizSubmissions.push({
          id: `qs_demo_${q.id}`,
          user_id: demoStudentId,
          quiz_id: q.id,
          course_id: courseId,
          score: 100,
          passed: 1,
          answers: JSON.stringify({ 0: 0, 1: 1, 2: 1 }),
          submitted_at: now
        });
      }

      // Certificate for completed course
      certificates.push({
        id: `cert_demo_crs_1`,
        user_id: demoStudentId,
        course_id: 'crs_1',
        certificate_code: 'EDUNOVA-CERT-2026-8849',
        student_name: 'Alex Rivera',
        course_title: 'Full-Stack Modern React & Node.js Masterclass',
        issued_at: now
      });
    }
  }

  // Seed random enrollments for 100 student accounts to produce realistic analytics
  for (let sIdx = 1; sIdx <= 100; sIdx++) {
    const studentId = `usr_std_${sIdx}`;
    // enroll each student in 2 random courses
    const c1 = `crs_${(sIdx % 26) + 1}`;
    const c2 = `crs_${((sIdx + 5) % 26) + 1}`;

    enrollments.push({
      id: `enr_${sIdx}_1`,
      user_id: studentId,
      course_id: c1,
      enrolled_at: now,
      progress_pct: Math.floor(Math.random() * 80) + 10,
      status: 'active',
      completed_at: null
    });
  }

  for (const enr of enrollments) {
    await dbPromise.run(
      `INSERT INTO enrollments (id, user_id, course_id, enrolled_at, progress_pct, status, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [enr.id, enr.user_id, enr.course_id, enr.enrolled_at, enr.progress_pct, enr.status, enr.completed_at]
    );
  }

  for (const lp of lessonProgress) {
    await dbPromise.run(
      `INSERT INTO lesson_progress (id, user_id, course_id, lesson_id, completed_at) VALUES (?, ?, ?, ?, ?)`,
      [lp.id, lp.user_id, lp.course_id, lp.lesson_id, lp.completed_at]
    );
  }

  for (const qs of quizSubmissions) {
    await dbPromise.run(
      `INSERT INTO quiz_submissions (id, user_id, quiz_id, course_id, score, passed, answers, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [qs.id, qs.user_id, qs.quiz_id, qs.course_id, qs.score, qs.passed, qs.answers, qs.submitted_at]
    );
  }

  for (const cert of certificates) {
    await dbPromise.run(
      `INSERT INTO certificates (id, user_id, course_id, certificate_code, student_name, course_title, issued_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cert.id, cert.user_id, cert.course_id, cert.certificate_code, cert.student_name, cert.course_title, cert.issued_at]
    );
  }

  // 4. Notifications & Audit Logs
  notifications.push(
    { id: 'nt_1', user_id: demoStudentId, title: 'Welcome to EduNova!', message: 'Explore over 25+ industry courses and track your progress in real-time.', type: 'info', read: 0, created_at: now },
    { id: 'nt_2', user_id: demoStudentId, title: 'Certificate Issued!', message: 'Congratulations! You earned a verified certificate for Full-Stack Modern React & Node.js Masterclass.', type: 'success', read: 0, created_at: now },
    { id: 'nt_3', user_id: 'usr_instructor_demo', title: 'New Course Enrolment', message: 'Over 45 new students enrolled in your Generative AI Engineering course today.', type: 'course', read: 0, created_at: now }
  );

  for (const n of notifications) {
    await dbPromise.run(
      `INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [n.id, n.user_id, n.title, n.message, n.type, n.read, n.created_at]
    );
  }

  auditLogs.push(
    { id: 'log_1', user_id: 'usr_admin_demo', action: 'DATABASE_SEEDED', details: 'Automated platform seeding executed successfully.', ip_address: '127.0.0.1', created_at: now },
    { id: 'log_2', user_id: 'usr_admin_demo', action: 'SYSTEM_HEALTH_CHECK', details: 'All 12 SQL schema tables verified and ready.', ip_address: '127.0.0.1', created_at: now }
  );

  for (const log of auditLogs) {
    await dbPromise.run(
      `INSERT INTO audit_logs (id, user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [log.id, log.user_id, log.action, log.details, log.ip_address, log.created_at]
    );
  }

  console.log(`✅ Seeded Enrollments, Certificates, Progress, Notifications & Audit Logs.`);
  console.log('🎉 EduNova Database Auto Seed Completed Successfully!');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  });
}

module.exports = seed;
