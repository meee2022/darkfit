import os
import re

def find_nested_buttons(directory):
    pattern = re.compile(r'<button[^>]*>[\s\S]*?<button', re.MULTILINE)
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        for file in files:
            if file.endswith(('.tsx', '.jsx', '.html', '.ts')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if pattern.search(content):
                            print(f'Found nested button in: {path}')
                            # Find line number
                            lines = content.split('\n')
                            for i, line in enumerate(lines):
                                if '<button' in line:
                                    # Check next lines for another <button
                                    for j in range(i, min(i + 10, len(lines))):
                                        if j > i and '<button' in lines[j] and '</button>' not in lines[i:j]:
                                            print(f'  Possible match near line {i+1}')
                except Exception as e:
                    print(f'Error reading {path}: {e}')

if __name__ == '__main__':
    find_nested_buttons('src')
