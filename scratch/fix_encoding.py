
import os

def fix_encoding(path):
    if not os.path.exists(path):
        return
    
    with open(path, 'rb') as f:
        content = f.read()

    # Define hex patterns to replace
    # These are common mangled UTF-8 sequences
    replacements = [
        (b'\xc3\xa2\xe2\x80\xa0\xe2\x80\x99', b' <i class="fas fa-arrow-right" style="margin-left:5px;"></i>'),
        (b'\xc3\xa2\xe2\x80\x9a\xc2\xac\xe2\x80\x94', b' \xe2\x80\x94 '), # em dash
        (b'\xc3\xa2\xe2\x80\x9a\xc2\xac\xc5\x93', b'"'), # left quote
        (b'\xc3\xa2\xe2\x80\x9a\xc2\xac\xc2\x9d', b'"'), # right quote
        (b'\xc3\xa2\xe2\x80\x9a\xc2\xac\xe2\x84\xa2', b"'"), # apostrophe
        (b'\xc3\xa2\xe2\x82\xac\xc2\xb9', b'\xe2\x82\xb9'), # rupee symbol
        # Generic catch-alls for the specific artifacts seen in the logs
        (b'Ã¢\x80\x94', b' \xe2\x80\x94 '),
        (b'Ã¢\x80\x9c', b'"'),
        (b'Ã¢\x80\x9d', b'"'),
        (b'Ã¢\x80\x99', b"'")
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(path, 'wb') as f:
        f.write(content)
    print(f"Fixed {path}")

# Fix all HTML files in the project
for root, dirs, files in os.walk(r'd:\NEW WEBSITE'):
    for file in files:
        if file.endswith('.html'):
            fix_encoding(os.path.join(root, file))
