import sys
import os

css_to_add = """
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
"""

files = sys.argv[1:]

for file_path in files:
    if "WritingGuide.vue" in file_path:
        continue
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "@keyframes spin" in content:
            print(f"Skipping {file_path}: already has animation")
            continue
            
        if "</style>" in content:
            # Check if we should insert before the last </style>
            # Use rsplit to replace only the last occurrence
            parts = content.rsplit("</style>", 1)
            new_content = parts[0] + css_to_add + "</style>" + parts[1]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {file_path}")
        else:
            print(f"Skipping {file_path}: no </style> tag found")
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
