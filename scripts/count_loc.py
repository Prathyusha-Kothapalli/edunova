import os

total_lines = 0
file_count = 0

exclude_dirs = {"node_modules", "tests", ".git", "coverage", "dist"}

for root, dirs, files in os.walk("."):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file.endswith((".js", ".py", ".html", ".css", ".json", ".md")):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    lines = len(f.readlines())
                    total_lines += lines
                    file_count += 1
            except Exception:
                pass

print(f"Total Production Files: {file_count}")
print(f"Total Production LOC:   {total_lines}")
