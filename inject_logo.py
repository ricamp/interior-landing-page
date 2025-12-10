
import re
import os

def inject_logo():
    base_path = r"c:\Users\ricar\OneDrive\Desktop\interior lading page"
    logo_path = os.path.join(base_path, "Logo.svg")
    html_path = os.path.join(base_path, "index.html")

    # Read Logo.svg
    with open(logo_path, "r", encoding="utf-8") as f:
        logo_content = f.read()

    # Extract inner content (paths) from Logo.svg
    # We look for everything between the first <svg ...> ang the last </svg>
    # Regex lazy match for inner content
    match = re.search(r"<svg[^>]*>(.*?)</svg>", logo_content, re.DOTALL)
    if not match:
        print("Could not find svg tag in Logo.svg")
        return
    
    new_svg_content = match.group(1)

    # Read index.html
    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    # Replace content in index.html
    # We match <svg class="logo-svg" ...> ... </svg>
    # Note: The attributes in index.html might vary slightly, so we match the class explicitly or just the ID if unique.
    # The previous view showed: <svg class="logo-svg" ... >
    
    # Python regex to replace:
    # Pattern looks for <svg class="logo-svg"[^>]*> ... </svg>
    
    pattern = r'(<svg class="logo-svg"[^>]*>)(.*?)(</svg>)'
    
    def replacer(m):
        return m.group(1) + "\n" + new_svg_content + "\n" + m.group(3)

    new_html_content, count = re.subn(pattern, replacer, html_content, flags=re.DOTALL)

    if count == 0:
        print("Could not find <svg class='logo-svg'...> in index.html")
        # Fallback: try finding by ID if class failed, or maybe spacing is different
        # Let's try a simpler identifier
        pattern_fallback = r'(<svg[^>]*id="Layer_1"[^>]*>)(.*?)(</svg>)'
        new_html_content, count = re.subn(pattern_fallback, replacer, html_content, flags=re.DOTALL)
        if count == 0:
             print("Fallback replacement also failed.")
             return

    # Write back
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(new_html_content)
    
    print("Successfully injected Logo.svg content into index.html")

if __name__ == "__main__":
    inject_logo()
