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
                            file_lines = content.split('\n')
                            for i, line in enumerate(file_lines):
                                if '<button' in line:
                                    # Check next lines for another <button
                                    for j in range(i + 1, min(i + 10, len(file_lines))):
                                        if '<button' in file_lines[j]:
                                            has_close = False
                                            for k in range(i, j):
                                                if '</button>' in file_lines[k]:
                                                    has_close = True
                                                    break
                                            if not has_close:
                                                print(f'  Possible match near line {i+1}')
                except Exception as e:
                    print(f'Error reading {path}: {e}')

if __name__ == '__main__':
    find_nested_buttons('src')
