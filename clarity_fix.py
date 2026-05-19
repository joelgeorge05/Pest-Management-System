import os
import re

directories_to_scan = [
    r"c:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\src\components\admin",
    r"c:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\src\components"
]

target_files = [
    "AdminDashboard.jsx",
    "AdminSidebar.jsx",
    "DashboardStats.jsx",
    "UserManagement.jsx",
    "DatasetClasses.jsx",
    "DatasetManager.jsx",
    "FeedbackAnalysis.jsx",
    "RetrainPanel.jsx",
    "AdminAnnouncements.jsx",
    "ForumManagement.jsx",
    "UserAnalysis.jsx",
    "UploadAnalyzer.jsx",
    "DiseaseGuide.jsx",
    "MedicineForm.jsx",
    "ShopForm.jsx",
    "History.jsx",
    "ResultsDisplay.jsx"
]

replacements = {
    # Text Darkening (Making text aggressively visible)
    r"text-slate-600": "text-slate-800",
    r"text-slate-500": "text-slate-700",
    r"text-slate-400": "text-slate-600",
    r"text-white": "text-slate-900",  # Any leftover text-white inside light cards
    
    # Background whitening
    r"bg-white/50": "bg-white",
    r"bg-white/40": "bg-white",
    r"bg-white/60": "bg-white",
    r"bg-white/80": "bg-white",
    r"bg-white/90": "bg-white",
    r"bg-white/95": "bg-white",
    
    r"bg-slate-100/40": "bg-slate-50",
    r"bg-slate-50/70": "bg-slate-100",
    
    # Fix Sidebar muddy inactive tab
    r"hover:bg-emerald-50": "hover:bg-emerald-100",
    
    # Admin Sidebar gradient removal (make it stark white)
    r"bg-gradient-to-b from-white via-teal-50 to-emerald-50": "bg-white",
    r"bg-black/20": "bg-slate-100",
    r"bg-black/10": "bg-slate-50",
    
    # Table headers
    r"bg-white/20": "bg-white",
}

for directory in directories_to_scan:
    if not os.path.exists(directory): continue
    for filename in os.listdir(directory):
        if filename in target_files:
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for old, new in sorted(replacements.items(), key=lambda x: len(x[0]), reverse=True):
                new_content = new_content.replace(old, new)
                
            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Aggressively clarified {filename}")

print("Clarity and contrast enhancement complete.")
