import os
import re

target_dir = r"c:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\src\components"

# Regex to match class string containing both a primary bg color and text-slate-900
# bg-(blue|green|emerald|indigo|amber|orange|purple|red)-(500|600|700)[/\d]*
bg_regex = r'bg-(blue|green|emerald|indigo|amber|orange|purple|red|teal)-(500|600|700|800)[^\s"\']*'

def fix_buttons():
    for root, _, files in os.walk(target_dir):
        for file in files:
            if not file.endswith((".jsx", ".js")): continue
            path = os.path.join(root, file)
            
            with open(path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                
            changed = False
            for i, line in enumerate(lines):
                if "text-slate-900" in line or "text-slate-800" in line:
                    if re.search(bg_regex, line) and "From-" not in line:
                        modified = line.replace("text-slate-900", "text-white").replace("text-slate-800", "text-white")
                        lines[i] = modified
                        changed = True
                        print(f"Fixed {file} line {i+1}: {modified.strip()}")
            
            if changed:
                with open(path, 'w', encoding='utf-8') as f:
                    f.writelines(lines)

if __name__ == "__main__":
    fix_buttons()
