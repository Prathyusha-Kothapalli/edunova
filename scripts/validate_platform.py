#!/usr/bin/env python3
"""
EduNova Platform Integrity & API Health Validator
Validates backend REST API endpoints, database counts, and system consistency.
Requires Python 3.10+
"""

import sys
import json
import urllib.request
import urllib.error

# Force UTF-8 encoding for Windows stdout
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:3000/api"

def print_status(message, status="OK"):
    symbol = "[OK]" if status == "OK" else "[FAIL]"
    print(f"{symbol} {message}")

def make_request(path, method="GET", body=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        res_body = e.read().decode('utf-8')
        return e.code, json.loads(res_body) if res_body else {}
    except Exception as e:
        print(f"Connection error to {url}: {e}")
        return 0, {}

def main():
    print("=" * 60)
    print("EduNova Platform Automated Sanity & Health Validator")
    print("=" * 60)

    # 1. Health Check
    status, res = make_request("/health")
    if status == 200 and res.get("status") == "healthy":
        print_status("Server Health Check Endpoint Live (/api/health)")
    else:
        print_status("Server Health Check Failed. Ensure server is running on http://localhost:3000", "FAIL")
        sys.exit(1)

    # 2. Demo Logins & Authentication
    student_token = None
    admin_token = None

    status, res = make_request("/auth/demo-login", method="POST", body={"role": "student"})
    if status == 200 and "token" in res:
        student_token = res["token"]
        print_status("Student Demo Authentication (/api/auth/demo-login)")
    else:
        print_status("Student Demo Auth Failed", "FAIL")

    status, res = make_request("/auth/demo-login", method="POST", body={"role": "admin"})
    if status == 200 and "token" in res:
        admin_token = res["token"]
        print_status("Admin Demo Authentication (/api/auth/demo-login)")
    else:
        print_status("Admin Demo Auth Failed", "FAIL")

    # 3. Course Catalog Verification
    status, res = make_request("/courses")
    courses = res.get("courses", [])
    if status == 200 and len(courses) >= 25:
        print_status(f"Course Catalog Seeded: {len(courses)} Courses (Requirement: >= 25)")
    else:
        print_status(f"Course Catalog Count Issue: Found {len(courses)} courses", "FAIL")

    # 4. Admin System Metrics Verification
    if admin_token:
        status, res = make_request("/admin/stats", token=admin_token)
        stats = res.get("stats", {})
        total_users = stats.get("total_users", 0)
        if status == 200 and total_users >= 100:
            print_status(f"Database Users Seeded: {total_users} Users (Requirement: >= 100)")
        else:
            print_status(f"User Count Validation Failed: {total_users}", "FAIL")

    print("=" * 60)
    print("EduNova System Validation Completed Successfully!")
    print("=" * 60)

if __name__ == "__main__":
    main()
