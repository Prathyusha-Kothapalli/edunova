import os
import zipfile

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_ZIP = os.path.join(BASE_DIR, "edunova.zip")

print("Creating edunova.zip including .git directory...")

exclude_names = {"node_modules", "edunova.zip", "repo.zip", ".DS_Store"}

with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(BASE_DIR):
        # Filter out excluded directory names
        dirs[:] = [d for d in dirs if d not in exclude_names]
        
        for file in files:
            if file in exclude_names:
                continue
            
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, BASE_DIR)
            zipf.write(full_path, arcname)

file_size_mb = os.path.getsize(OUTPUT_ZIP) / (1024 * 1024)
print(f"[OK] edunova.zip created successfully! Path: {OUTPUT_ZIP} ({file_size_mb:.2f} MB)")
