import os

files_to_include = [
    # Backend Core
    "backend/app.py",
    "backend/train_improved.py",
    "backend/train_transformer.py",
    # Frontend Core
    "src/App.jsx",
    "src/components/LandingPage.jsx",
    # Key Features
    "src/components/UploadAnalyzer.jsx",
    "src/components/AdminDashboard.jsx",
    "src/components/WeatherWidget.jsx",
    "src/components/Chatbot.jsx",
]

def extract_snippet(filepath, max_lines=100):
    try:
        if not os.path.exists(filepath):
            return f"## {filepath}\n\nFile not found.\n\n"
            
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        ext = filepath.split('.')[-1]
        lang = "python" if ext == "py" else ("javascript" if ext in ["js", "jsx"] else "")
        
        # Take the first max_lines to keep PDF size manageable but informative
        content = "".join(lines[:max_lines])
        if len(lines) > max_lines:
            content += f"\n... (truncated: showing first {max_lines} lines of {len(lines)}) ...\n"
        
        return f"## {filepath}\n\n```{lang}\n{content}\n```\n\n"
    except Exception as e:
        return f"## {filepath}\n\nCould not read file: {e}\n\n"

with open("Important_Code.md", "w", encoding='utf-8') as f:
    f.write("# Smart Pest Management System - Core Implementation\n\n")
    f.write("This document contains the most important parts of the code for the Smart Pest Management System, including backend logic, AI model training, and key frontend components.\n\n")
    
    # Simple Table of Contents
    f.write("## Table of Contents\n\n")
    for filepath in files_to_include:
        anchor = filepath.lower().replace("/", "").replace(".", "")
        f.write(f"- [{filepath}](#{anchor})\n")
    f.write("\n---\n\n")
    
    for filepath in files_to_include:
        f.write(extract_snippet(filepath))

print("Markdown generated: Important_Code.md")
