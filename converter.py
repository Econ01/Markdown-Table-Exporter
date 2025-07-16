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
    <title>Modern Markdown Table Viewer</title>
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
            --border-radius: 12px;
            --shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            --transition: all 0.3s ease;
            --cell-border: 1px solid #dee2e6;
        }}

        [data-theme="dark"] {{
            --primary: #5a75f0;
            --primary-dark: #4a64d6;
            --light: #121212;
            --dark: #f8f9fa;
            --gray: #adb5bd;
            --light-gray: #2d2d2d;
            --shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            --cell-border: 1px solid #444;
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
            color: var(--dark);
            line-height: 1.6;
            min-height: 100vh;
            padding: 2rem 1rem;
            transition: var(--transition);
        }}

        [data-theme="dark"] body {{
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
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

        .logo {{
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 1rem;
        }}

        .logo-icon {{
            background: var(--primary);
            color: white;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }}

        h1 {{
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }}

        .card {{
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            overflow: hidden;
            margin-bottom: 2rem;
            transition: var(--transition);
        }}

        [data-theme="dark"] .card {{
            background: #1e1e2e;
        }}

        [data-theme="dark"] .card-header {{
            border-bottom: 1px solid #333;
        }}

        .btn {{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 0.7rem 1.2rem;
            font-weight: 500;
            border-radius: 8px;
            cursor: pointer;
            border: none;
            transition: var(--transition);
            font-size: 0.95rem;
        }}

        .btn-primary {{
            background: var(--primary);
            color: white;
        }}

        .btn-primary:hover {{
            background: var(--primary-dark);
            transform: translateY(-2px);
        }}

        .btn-icon {{
            width: 38px;
            height: 38px;
            border-radius: 50%;
            padding: 0;
        }}

        .table-container {{
            overflow-x: auto;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            margin-bottom: 2rem;
            background: white;
        }}

        [data-theme="dark"] .table-container {{
            background: #1e1e2e;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            min-width: 600px;
            table-layout: fixed;
        }}

        th, td {{
            border-left: var(--cell-border);
            border-right: var(--cell-border);
            border-bottom: var(--cell-border);
            padding: 0.9rem 1.2rem;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }}

        thead tr:first-child th {{
            border-top: var(--cell-border);
        }}

        tbody tr:first-child td {{
            border-top: none;
        }}

        th:first-child, td:first-child {{
            border-left: none;
        }}

        th:last-child, td:last-child {{
            border-right: none;
        }}

        th {{
            background: rgba(67, 97, 238, 0.1);
            color: var(--primary);
            font-weight: 600;
            text-align: left;
            border-bottom: 2px solid var(--primary);
        }}

        [data-theme="dark"] th {{
            background: rgba(67, 97, 238, 0.15);
        }}

        tbody tr:last-child td {{
            border-bottom: none;
        }}

        tbody tr:hover td {{
            background: rgba(67, 97, 238, 0.05);
        }}

        [data-theme="dark"] tbody tr:hover td {{
            background: rgba(67, 97, 238, 0.1);
        }}

        .category-row td {{
            background: rgba(115, 9, 183, 0.1);
            font-weight: 700;
            color: var(--secondary);
            font-size: 1.1em;
            padding: 1rem 1.5rem;
            text-align: center;
            border-top: 2px solid rgba(115, 9, 183, 0.2);
            border-bottom: 2px solid rgba(115, 9, 183, 0.2);
        }}

        [data-theme="dark"] .category-row td {{
            background: rgba(115, 9, 183, 0.2);
            color: #b57de2;
        }}

        body[data-density="compact"] th,
        body[data-density="compact"] td {{
        padding: 0.3rem 0.6rem;
        font-size: 0.85rem;
        }}

        footer {{
            text-align: center;
            margin-top: 3rem;
            color: var(--gray);
            font-size: 0.9rem;
        }}

        footer a {{
            color: var(--primary);
            text-decoration: none;
        }}

        footer a:hover {{
            text-decoration: underline;
        }}

        .theme-toggle, .density-toggle {{
            position: fixed;
            top: 20px;
            right: 20px;
            width: 46px;
            height: 46px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            color: var(--dark);
            box-shadow: var(--shadow);
            border: none;
            cursor: pointer;
            z-index: 100;
            transition: var(--transition);
        }}

        .theme-toggle {{ right: 20px; }}
        .density-toggle {{ right: 80px; }}
        [data-theme="dark"] .theme-toggle,
        [data-theme="dark"] .density-toggle {{
        background: #252537;
        color: var(--light);
        }}

        [data-theme="dark"] .theme-toggle, .density-toggle {{
            background: #252537;
            color: var(--light);
        }}

        .export-menu {{
            position: fixed;
            bottom: 30px;
            right: 30px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            z-index: 100;
        }}

        .export-btn {{
            width: 56px;
            height: 56px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary);
            color: white;
            font-size: 1.2rem;
            box-shadow: 0 6px 16px rgba(67, 97, 238, 0.3);
            border: none;
            cursor: pointer;
            transition: var(--transition);
        }}

        .export-btn:hover {{
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 8px 20px rgba(67, 97, 238, 0.4);
        }}

        .export-options {{
            position: absolute;
            bottom: 70px;
            right: 0;
            background: white;
            border-radius: 12px;
            box-shadow: var(--shadow);
            padding: 10px;
            display: none;
            flex-direction: column;
            gap: 8px;
            min-width: 180px;
            transform-origin: bottom right;
            animation: scaleIn 0.2s ease;
        }}

        [data-theme="dark"] .export-options {{
            background: #252537;
        }}

        .export-options button {{
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 0.7rem 1rem;
            background: transparent;
            border: none;
            border-radius: 8px;
            color: var(--dark);
            cursor: pointer;
            text-align: left;
            transition: var(--transition);
            font-size: 0.95rem;
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
                font-size: 2rem;
            }}
            
            .card-header {{
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }}
            
            .controls {{
                width: 100%;
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
            <div class="logo">
                <div class="logo-icon">
                    <i class="fas fa-table"></i>
                </div>
                <h1>{md_file}</h1>
            </div>
        </header>

        <main>
            <div class="card">
                <div class="table-container">
                    {''.join(html_table)}
                </div>
            </div>
        </main>

        <footer>
            <p>Modern Markdown Table Viewer • Created by Cem Çakmak</p>
            <p>Converted from: {md_file}</p>
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
            const rows = document.querySelectorAll('table tr');
            let csv = [];
            
            for (const row of rows) {{
                const cells = Array.from(row.querySelectorAll('th, td')).map(cell => {{
                    let text = cell.textContent.trim();
                    // Escape quotes
                    text = text.replace(/"/g, '""');
                    return `"${{text}}"`;
                }});
                csv.push(cells.join(','));
            }}
            
            const blob = new Blob([csv.join('\\n')], {{ type: 'text/csv' }});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'table_export.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            showNotification('CSV exported successfully!');
        }}
        
        function exportToPDF() {{
            const {{ jsPDF }} = window.jspdf;
            const pdf = new jsPDF();
            
            // Add title
            pdf.setFontSize(18);
            pdf.text('Markdown Table Export', 15, 15);
            
            // Add table
            pdf.autoTable({{
                html: 'table',
                startY: 25,
                styles: {{
                    fontSize: 10,
                    cellPadding: 4,
                    valign: 'middle'
                }},
                headStyles: {{
                    fillColor: [67, 97, 238],
                    textColor: 255,
                    fontStyle: 'bold'
                }},
                alternateRowStyles: {{
                    fillColor: [245, 245, 245]
                }},
                margin: {{ top: 20 }}
            }});
            
            pdf.save('table_export.pdf');
            showNotification('PDF exported successfully!');
        }}
        
        function copyToClipboard() {{
            const tableHTML = document.querySelector('.table-container').innerHTML;
            navigator.clipboard.writeText(tableHTML)
                .then(() => showNotification('HTML copied to clipboard!'))
                .catch(err => showNotification('Failed to copy: ' + err));
        }}
        
        function showNotification(message) {{
            // Create notification element
            const notification = document.createElement('div');
            notification.textContent = message;
            notification.style.position = 'fixed';
            notification.style.bottom = '30px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = 'var(--primary)';
            notification.style.color = 'white';
            notification.style.padding = '12px 24px';
            notification.style.borderRadius = '8px';
            notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            notification.style.zIndex = '1000';
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s, transform 0.3s';
            
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