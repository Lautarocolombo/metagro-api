import re

with open('frontend/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of the embedded DEFAULT_PRODUCTS script (the first window.DEFAULT_PRODUCTS = [)
start_marker = "window.DEFAULT_PRODUCTS = ["
start_pos = content.find(start_marker)
if start_pos == -1:
    print('DEFAULT_PRODUCTS start not found')
    exit(1)

# Find the </script> that closes this block
close_script = content.find('</script>', start_pos)
if close_script == -1:
    print('Closing </script> not found')
    exit(1)
close_script_end = close_script + len('</script>')

# Find the next <script src="js/app.js"></script> after that
app_js_marker = '<script src="js/app.js"></script>'
app_js_pos = content.find(app_js_marker, close_script_end)
if app_js_pos == -1:
    print('app.js script marker not found')
    exit(1)

# Keep everything before the embedded script, and from app.js onwards
before = content[:start_pos]
after = content[app_js_pos:]

new_content = before + after

with open('frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Fixed index.html: removed embedded duplicate script block, kept app.js external loading.')
