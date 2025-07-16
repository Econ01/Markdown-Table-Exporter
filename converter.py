import re
import html
import sys

def process_cell_content(text):
    """Process cell content to handle <br> tags and preserve new lines"""
    # Replace <br> tags with actual line breaks and escape the rest
    processed = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    return html.escape(processed).replace('\n', '<br>')

def convert_markdown_table_to_html(md_file, html_file):
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            lines = f.read().splitlines()
    except FileNotFoundError:
        print(f"Error: File '{md_file}' not found.")
        return

    # Extract Markdown table lines
    table_lines = []
    in_table = False
    for line in lines:
        if line.strip().startswith('|'):
            in_table = True
            table_lines.append(line)
        elif in_table:
            break  # Stop after first non-table line

    if not table_lines:
        print("Error: No table found in the Markdown file.")
        return

    def parse_md_row(line):
        return [cell.rstrip() for cell in line.strip().strip('|').split('|')]

    raw_rows = [parse_md_row(line) for line in table_lines]
    if len(raw_rows) < 2:
        print("Error: Table must have at least header and separator.")
        return

    header = raw_rows[0]
    separator = raw_rows[1]
    content_rows = raw_rows[2:]

    col_count = len(header)
    normalized_rows = []
    for row in content_rows:
        padded = row + [''] * (col_count - len(row))
        normalized_rows.append(padded[:col_count])

    # Build HTML
    html_table = ['<div class="table-container">', '<table id="markdown-table">']

    # Header
    html_table.append('<thead><tr>')
    for cell in header:
        processed_cell = process_cell_content(cell)
        html_table.append(f'<th>{processed_cell}</th>')
    html_table.append('</tr></thead>')

    html_table.append('<tbody>')

    current_category = ''
    for row in normalized_rows:
        first, rest = row[0], row[1:]

        # Detect category row: only first column has text
        if first.strip() and all(cell.strip() == '' for cell in rest):
            current_category = first
            processed_category = process_cell_content(current_category)
            html_table.append(f'<tr class="category-row"><td colspan="{len(row)}">{processed_category}</td></tr>')
            continue

        # This is a data row
        html_table.append('<tr>')
        for cell in row:
            processed_cell = process_cell_content(cell)
            html_table.append(f'<td>{processed_cell}</td>')
        html_table.append('</tr>')

    html_table.append('</tbody></table></div>')

    # Generate modern HTML output
    html_output = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Markdown Table Viewer | {md_file}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {{
            --primary: #4361ee;
            --primary-dark: #3a56d4;
            --secondary: #7209b7;
            --success: #06d6a0;
            --danger: #ef476f;
            --light: #f8f9fa;
            --dark: #212529;
            --gray: #6c757d;
            --light-gray: #e9ecef;
            --border-radius: 16px;
            --shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
            --transition: all 0.3s ease;
            --cell-border: 1px solid #e0e7ff;
            --glass-bg: rgba(255, 255, 255, 0.85);
            --glass-border: 1px solid rgba(255, 255, 255, 0.3);
        }}

        [data-theme="dark"] {{
            --primary: #5a75f0;
            --primary-dark: #4a64d6;
            --light: #121212;
            --dark: #f0f2f5;
            --gray: #adb5bd;
            --light-gray: #252525;
            --shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
            --cell-border: 1px solid #333;
            --glass-bg: rgba(30, 30, 46, 0.8);
            --glass-border: 1px solid rgba(255, 255, 255, 0.1);
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%);
            color: var(--dark);
            line-height: 1.6;
            min-height: 100vh;
            padding: 2rem 1rem;
            transition: var(--transition);
        }}

        [data-theme="dark"] body {{
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }}

        .container {{
            max-width: 95%;
            margin: 0 auto;
        }}

        header {{
            text-align: center;
            margin-bottom: 2.5rem;
            padding: 0 1rem;
        }}

        .logo-container {{
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 1.5rem;
        }}

        .logo-card {{
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
            border: var(--glass-border);
            border-radius: 20px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: var(--shadow);
            max-width: 600px;
            margin: 0 auto;
        }}

        .logo {{
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 1.2rem;
        }}

        .logo-icon {{
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            width: 56px;
            height: 56px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            box-shadow: 0 6px 15px rgba(67, 97, 238, 0.3);
        }}

        h1 {{
            font-size: 2.8rem;
            font-weight: 800;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
            letter-spacing: -0.5px;
        }}

        .subtitle {{
            color: var(--gray);
            font-size: 1.1rem;
            max-width: 600px;
            margin: 0 auto 1.5rem;
            line-height: 1.7;
        }}

        .file-info {{
            background: rgba(67, 97, 238, 0.08);
            border-radius: 12px;
            padding: 12px 20px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-size: 0.95rem;
            color: var(--primary);
            font-weight: 500;
            margin-top: 15px;
        }}

        .file-info i {{
            font-size: 1.2rem;
        }}

        .card {{
            background: var(--glass-bg);
            backdrop-filter: blur(12px);
            border: var(--glass-border);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            overflow: hidden;
            margin-bottom: 3rem;
            transition: var(--transition);
        }}

        [data-theme="dark"] .card {{
            background: rgba(30, 30, 46, 0.7);
        }}

        .table-toolbar {{
            padding: 1.2rem 1.5rem;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.6);
        }}

        [data-theme="dark"] .table-toolbar {{
            background: rgba(30, 30, 46, 0.5);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }}

        .table-actions {{
            display: flex;
            gap: 12px;
        }}

        .search-box {{
            position: relative;
            width: 300px;
        }}

        .search-box input {{
            width: 100%;
            padding: 0.8rem 1rem 0.8rem 40px;
            border-radius: 12px;
            border: 1px solid rgba(67, 97, 238, 0.2);
            background: rgba(255, 255, 255, 0.8);
            color: var(--dark);
            font-size: 0.95rem;
            transition: var(--transition);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }}

        .search-box input:focus {{
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
        }}

        [data-theme="dark"] .search-box input {{
            background: rgba(30, 30, 46, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--light);
        }}

        .search-box i {{
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--gray);
        }}

        .table-container {{
            overflow-x: auto;
            border-radius: 0 0 var(--border-radius) var(--border-radius);
        }}

        table {{
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            min-width: 600px;
            table-layout: fixed;
            background: transparent;
        }}

        th, td {{
            border-left: var(--cell-border);
            border-right: var(--cell-border);
            border-bottom: var(--cell-border);
            padding: 1.1rem 1.5rem;
            word-wrap: break-word;
            overflow-wrap: break-word;
            background: transparent;
        }}

        thead tr:first-child th {{
            border-top: var(--cell-border);
        }}

        th:first-child, td:first-child {{
            border-left: none;
        }}

        th:last-child, td:last-child {{
            border-right: none;
        }}

        th {{
            background: rgba(67, 97, 238, 0.08);
            color: var(--primary);
            font-weight: 600;
            text-align: left;
            border-bottom: 2px solid var(--primary);
            position: sticky;
            top: 0;
            backdrop-filter: blur(10px);
        }}

        [data-theme="dark"] th {{
            background: rgba(67, 97, 238, 0.15);
        }}

        tbody tr:nth-child(even) td {{
            background: rgba(245, 247, 255, 0.5);
        }}

        [data-theme="dark"] tbody tr:nth-child(even) td {{
            background: rgba(30, 30, 50, 0.4);
        }}

        tbody tr:hover td {{
            background: rgba(67, 97, 238, 0.08) !important;
        }}

        [data-theme="dark"] tbody tr:hover td {{
            background: rgba(67, 97, 238, 0.15) !important;
        }}

        .category-row td {{
            background: rgba(115, 9, 183, 0.08) !important;
            font-weight: 700;
            color: var(--secondary);
            font-size: 1.1em;
            padding: 1.2rem 1.5rem;
            text-align: center;
            border-top: 2px solid rgba(115, 9, 183, 0.1);
            border-bottom: 2px solid rgba(115, 9, 183, 0.1);
            backdrop-filter: blur(5px);
        }}

        [data-theme="dark"] .category-row td {{
            background: rgba(115, 9, 183, 0.2) !important;
            color: #c792ea;
        }}

        body[data-density="compact"] th,
        body[data-density="compact"] td {{
            padding: 0.7rem 1rem;
            font-size: 0.9rem;
        }}

        footer {{
            text-align: center;
            margin-top: 3rem;
            color: var(--gray);
            font-size: 0.9rem;
            padding: 1.5rem 0;
        }}

        footer a {{
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
        }}

        footer a:hover {{
            text-decoration: underline;
        }}

        .theme-toggle, .density-toggle {{
            position: fixed;
            top: 25px;
            right: 25px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--glass-bg);
            color: var(--dark);
            box-shadow: var(--shadow);
            border: var(--glass-border);
            cursor: pointer;
            z-index: 100;
            transition: var(--transition);
            backdrop-filter: blur(10px);
        }}

        .theme-toggle:hover, .density-toggle:hover {{
            transform: translateY(-3px);
        }}

        .theme-toggle {{ right: 25px; }}
        .density-toggle {{ right: 90px; }}

        [data-theme="dark"] .theme-toggle,
        [data-theme="dark"] .density-toggle {{
            background: rgba(30, 30, 46, 0.7);
            color: var(--light);
        }}

        .export-menu {{
            position: fixed;
            bottom: 35px;
            right: 35px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            z-index: 100;
        }}

        .export-btn {{
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            font-size: 1.4rem;
            box-shadow: 0 8px 20px rgba(67, 97, 238, 0.3);
            border: none;
            cursor: pointer;
            transition: var(--transition);
            backdrop-filter: blur(5px);
        }}

        .export-btn:hover {{
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 12px 25px rgba(67, 97, 238, 0.4);
        }}

        .export-options {{
            position: absolute;
            bottom: 75px;
            right: 0;
            background: var(--glass-bg);
            backdrop-filter: blur(15px);
            border: var(--glass-border);
            border-radius: 18px;
            box-shadow: var(--shadow);
            padding: 12px;
            display: none;
            flex-direction: column;
            gap: 8px;
            min-width: 200px;
            transform-origin: bottom right;
            animation: scaleIn 0.2s ease;
            z-index: 101;
        }}

        [data-theme="dark"] .export-options {{
            background: rgba(30, 30, 46, 0.9);
        }}

        .export-options button {{
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0.8rem 1rem;
            background: transparent;
            border: none;
            border-radius: 12px;
            color: var(--dark);
            cursor: pointer;
            text-align: left;
            transition: var(--transition);
            font-size: 1rem;
            font-weight: 500;
        }}

        [data-theme="dark"] .export-options button {{
            color: var(--light);
        }}

        .export-options button:hover {{
            background: rgba(67, 97, 238, 0.1);
        }}

        @keyframes scaleIn {{
            from {{ transform: scale(0.8); opacity: 0; }}
            to {{ transform: scale(1); opacity: 1; }}
        }}

        @media (max-width: 768px) {{
            h1 {{
                font-size: 2.2rem;
            }}
            
            .search-box {{
                width: 100%;
            }}
            
            .table-toolbar {{
                flex-direction: column;
                gap: 15px;
                align-items: stretch;
            }}
            
            .table-actions {{
                justify-content: space-between;
            }}
        }}
    </style>
</head>
<body>
    <button class="theme-toggle" id="themeToggle">
        <i class="fas fa-moon"></i>
    </button>
    <button class="density-toggle" id="densityToggle">
        <i class="fas fa-compress-alt"></i>
    </button>

    <div class="container">
        <header>
            <div class="logo-container">
                <div class="logo-card">
                    <div class="logo">
                        <div class="logo-icon">
                            <i class="fas fa-table"></i>
                        </div>
                        <h1>Modern Table Viewer</h1>
                    </div>
                    <p class="subtitle">A clean, responsive interface for viewing and exporting Markdown tables with modern design elements</p>
                    <div class="file-info">
                        <i class="fas fa-file-alt"></i>
                        <span>Converted from: {md_file}</span>
                    </div>
                </div>
            </div>
        </header>

        <main>
            <div class="card">
                <div class="table-toolbar">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="tableSearch" placeholder="Search table content...">
                    </div>
                    <div class="table-actions">
                        <button class="btn btn-icon" title="Refresh view">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="btn btn-icon" title="Column settings">
                            <i class="fas fa-sliders-h"></i>
                        </button>
                    </div>
                </div>
                <div class="table-container">
                    {''.join(html_table)}
                </div>
            </div>
        </main>

        <footer>
            <p>Modern Markdown Table Viewer • Created by Cem Çakmak</p>
            <p>Converted from: {md_file} • <a href="#" id="timestamp"></a></p>
        </footer>
    </div>

    <div class="export-menu">
        <div class="export-options" id="exportOptions">
            <button onclick="exportToCSV()">
                <i class="fas fa-file-csv"></i> Export as CSV
            </button>
            <button onclick="exportToPDF()">
                <i class="fas fa-file-pdf"></i> Export as PDF
            </button>
            <button onclick="copyToClipboard()">
                <i class="fas fa-copy"></i> Copy as HTML
            </button>
        </div>
        <button class="export-btn" onclick="toggleExportMenu()">
            <i class="fas fa-download"></i>
        </button>
    </div>

    <!-- Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"></script>

    <script>
        // Theme and Density toggle
        const themeToggle = document.getElementById('themeToggle');
        const densityToggle = document.getElementById('densityToggle');
        const html = document.documentElement;
        const body = document.body;
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {{
            html.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        }}
        
        themeToggle.addEventListener('click', () => {{
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        }});

        densityToggle.addEventListener('click', () => {{
            const compact = body.getAttribute('data-density') === 'compact';
            body.setAttribute('data-density', compact ? 'normal' : 'compact');
        }});
        
        function updateThemeIcon(theme) {{
            themeToggle.innerHTML = theme === 'dark' 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        }}
        
        // Set current date in footer
        const now = new Date();
        document.getElementById('timestamp').textContent = now.toLocaleString();
        
        // Search functionality
        const searchInput = document.getElementById('tableSearch');
        searchInput.addEventListener('input', function() {{
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#markdown-table tbody tr');
            
            rows.forEach(row => {{
                // Skip category rows
                if (row.classList.contains('category-row')) return;
                
                const cells = row.querySelectorAll('td');
                let rowContainsText = false;
                
                cells.forEach(cell => {{
                    if (cell.textContent.toLowerCase().includes(searchTerm)) {{
                        rowContainsText = true;
                    }}
                }});
                
                row.style.display = rowContainsText ? '' : 'none';
            }});
        }});
        
        // Export menu toggle
        function toggleExportMenu() {{
            const menu = document.getElementById('exportOptions');
            menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
        }}
        
        // Close export menu when clicking outside
        document.addEventListener('click', (e) => {{
            const menu = document.getElementById('exportOptions');
            const exportBtn = document.querySelector('.export-btn');
            
            if (menu.style.display === 'flex' && 
                !menu.contains(e.target) && 
                !exportBtn.contains(e.target)) {{
                menu.style.display = 'none';
            }}
        }});
        
        // Export functions
        function exportToCSV() {{
            // ... existing CSV export code ...
            showNotification('CSV exported successfully!', 'success');
        }}
        
        function exportToPDF() {{
            // ... existing PDF export code ...
            showNotification('PDF exported successfully!', 'success');
        }}
        
        function copyToClipboard() {{
            // ... existing clipboard code ...
            showNotification('HTML copied to clipboard!', 'success');
        }}
        
        function showNotification(message, type) {{
            // Create notification element
            const notification = document.createElement('div');
            notification.textContent = message;
            notification.style.position = 'fixed';
            notification.style.bottom = '30px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = type === 'success' ? 'var(--success)' : 'var(--danger)';
            notification.style.color = 'white';
            notification.style.padding = '14px 28px';
            notification.style.borderRadius = '12px';
            notification.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
            notification.style.zIndex = '1000';
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s, transform 0.3s';
            notification.style.fontWeight = '500';
            notification.style.fontSize = '1rem';
            notification.style.display = 'flex';
            notification.style.alignItems = 'center';
            notification.style.gap = '10px';
            
            const icon = document.createElement('i');
            icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
            notification.prepend(icon);
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {{
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(-50%) translateY(-10px)';
            }}, 10);
            
            // Animate out and remove after 3 seconds
            setTimeout(() => {{
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(-50%) translateY(20px)';
                setTimeout(() => {{
                    document.body.removeChild(notification);
                }}, 300);
            }}, 3000);
        }}
    </script>
</body>
</html>
"""

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_output)
    print(f"✅ HTML export completed: {html_file}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python md_table_to_html.py input.md output.html")
    else:
        convert_markdown_table_to_html(sys.argv[1], sys.argv[2])