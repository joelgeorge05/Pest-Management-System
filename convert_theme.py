import os
import re

directories_to_scan = [
    r"c:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\src\components\admin",
    r"c:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\src\components"
]

target_files = [
    "ResultsDisplay.jsx"
]

replacements = {
    # Backgrounds
    r"bg-slate-950": "bg-slate-50",
    r"bg-slate-900/60": "bg-white/80",
    r"bg-slate-900/80": "bg-white/95",
    r"bg-slate-900": "bg-white",
    r"bg-slate-800/80": "bg-slate-50/90",
    r"bg-slate-800/60": "bg-slate-50/70",
    r"bg-slate-800": "bg-slate-100",
    r"bg-slate-700": "bg-slate-200",
    
    # Text
    r"text-slate-100": "text-slate-900",
    r"text-slate-200": "text-slate-800",
    r"text-slate-300": "text-slate-700",
    r"text-slate-400": "text-slate-600",
    
    # Borders
    r"border-slate-700/50": "border-slate-200/80",
    r"border-slate-700": "border-slate-200",
    r"border-white/50": "border-slate-200",
    r"border-white/40": "border-slate-200",
    r"border-white/20": "border-slate-200/50",
    r"border-white": "border-slate-200",
    
    # Emerald/Indigo dark tweaks to light tweaks
    r"text-emerald-400": "text-emerald-700",
    r"text-emerald-300": "text-emerald-800",
    r"text-emerald-200": "text-emerald-900",
    r"hover:text-emerald-300": "hover:text-emerald-700",
    
    r"text-indigo-400": "text-indigo-700",
    r"text-indigo-300": "text-indigo-800",

    # Ring
    r"ring-white/50": "ring-slate-200/50",
    r"ring-white/10": "ring-slate-100",
    
    r"shadow-emerald-900/20": "shadow-emerald-500/10",
    
    # Divider
    r"divide-slate-800/50": "divide-slate-100",
    r"divide-slate-800": "divide-slate-200",
}

for directory in directories_to_scan:
    if not os.path.exists(directory): continue
    for filename in os.listdir(directory):
        if filename in target_files:
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            # Apply replacements carefully
            # We sort keys by length descending so longer matches (like bg-slate-900/80) are replaced before shorter ones (bg-slate-900)
            for old, new in sorted(replacements.items(), key=lambda x: len(x[0]), reverse=True):
                new_content = new_content.replace(old, new)
                
            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filename}")

print("Done converting to light theme.")
