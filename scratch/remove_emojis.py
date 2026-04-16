import os
import re

# List of emojis to remove
EMOJIS_TO_REMOVE = [
    "👋", "🚀", "🎯", "📈", "💰", "💡", "✅", "✨", "🔥", "⚡️", "🤝", "🙌", "👏", "📱", "💻", "💼", "📊"
]

# Files to process
TARGET_DIRS = [
    "d:\\NEW WEBSITE",
    "d:\\NEW WEBSITE\\about",
    "d:\\NEW WEBSITE\\services",
    "d:\\NEW WEBSITE\\portfolio",
    "d:\\NEW WEBSITE\\contact",
    "d:\\NEW WEBSITE\\calendar",
    "d:\\NEW WEBSITE\\blog"
]

def remove_emojis_from_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        for emoji in EMOJIS_TO_REMOVE:
            content = content.replace(emoji, "")
            
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def main():
    for directory in TARGET_DIRS:
        if not os.path.exists(directory):
            continue
            
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith((".html", ".js", ".css")):
                    file_path = os.path.join(root, file)
                    remove_emojis_from_file(file_path)

if __name__ == "__main__":
    main()
