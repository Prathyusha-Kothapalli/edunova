#!/usr/bin/env python3
"""
EduNova Platform Analytics & Data Exporter
Aggregates metrics and generates CSV/JSON analytical reports.
Requires Python 3.10+
"""

import os
import sys
import csv
import sqlite3

# Force UTF-8 encoding for Windows stdout
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "server", "db", "edunova.db")
OUTPUT_CSV = os.path.join(os.path.dirname(__file__), "analytics_report.csv")

def export_analytics():
    print("=" * 60)
    print("EduNova Platform Analytics & Metrics Exporter")
    print("=" * 60)

    if not os.path.exists(DB_PATH):
        print(f"Database file not found at {DB_PATH}. Run 'npm run seed' first.")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Total Metrics
    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'student'")
    students_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'instructor'")
    instructors_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM courses")
    courses_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM lessons")
    lessons_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM quizzes")
    quizzes_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM enrollments")
    enrollments_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM certificates")
    certificates_count = cursor.fetchone()[0]

    print("\n--- Platform Core Metrics Summary ---")
    print(f"Total Users:         {total_users}")
    print(f"Students:            {students_count}")
    print(f"Instructors:         {instructors_count}")
    print(f"Courses:             {courses_count}")
    print(f"Lessons:             {lessons_count}")
    print(f"Quizzes:             {quizzes_count}")
    print(f"Active Enrollments:  {enrollments_count}")
    print(f"Certificates Issued: {certificates_count}")

    # 2. Export Courses Summary to CSV
    cursor.execute("""
        SELECT id, title, category, level, price, rating, students_count
        FROM courses
        ORDER BY students_count DESC
    """)
    courses_data = cursor.fetchall()

    with open(OUTPUT_CSV, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Course ID", "Title", "Category", "Level", "Price ($)", "Rating", "Enrolled Students"])
        for row in courses_data:
            writer.writerow(row)

    print(f"\n[OK] Exported {len(courses_data)} courses to CSV report: {os.path.abspath(OUTPUT_CSV)}")
    print("=" * 60)

    conn.close()

if __name__ == "__main__":
    export_analytics()
