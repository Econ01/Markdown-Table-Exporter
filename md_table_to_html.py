import re
import html
import sys
import os

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

    # Prepare original markdown (used for exporting as PDF)
    original_md = '\n'.join(table_lines)

    pdf_title = os.path.splitext(os.path.basename(md_file))[0]

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
            /* hsl (fallback color) */
            --bg-dark: hsl(204 68% 90%);
            --bg: hsl(204 100% 95%);
            --bg-light: hsl(204 100% 100%);
            --text: hsl(210 100% 5%);
            --text-muted: hsl(202 46% 27%);
            --highlight: hsl(204 100% 100%);
            --border: hsl(203 26% 50%);
            --border-muted: hsl(204 35% 62%);
            --primary: hsl(197 100% 19%);
            --secondary: hsl(31 100% 21%);
            --danger: hsl(9 25% 41%);
            --warning: hsl(51 29% 33%);
            --success: hsl(148 24% 35%);
            --info: hsl(217 26% 42%);

            /* oklch */
            --bg-dark: oklch(0.92 0.03 237);
            --bg: oklch(0.96 0.03 237);
            --bg-light: oklch(1 0.03 237);
            --text: oklch(0.15 0.06 237);
            --text-muted: oklch(0.4 0.06 237);
            --highlight: oklch(1 0.06 237);
            --border: oklch(0.6 0.06 237);
            --border-muted: oklch(0.7 0.06 237);
            --primary: oklch(0.4 0.1 237);
            --secondary: oklch(0.4 0.1 57);
            --danger: oklch(0.5 0.06 30);
            --warning: oklch(0.5 0.06 100);
            --success: oklch(0.5 0.06 160);
            --info: oklch(0.5 0.06 260);

            --bg-header: oklch(0.96 0.03 237 / 0.5);
            --bg-header-element: oklch(1 0.03 237 / 0.75);

            --box-shadow: 
                0 1px 2px rgba(0, 0, 0, 0.07),
                0 2px 4px rgba(0, 0, 0, 0.06),
                0 4px 8px rgba(0, 0, 0, 0.05);

            --box-shadow-elevated: 
                0 10px 20px rgba(0, 0, 0, 0.1),
                0 15px 30px rgba(0, 0, 0, 0.08),
                0 20px 40px rgba(0, 0, 0, 0.06);

            --box-shadow-subtle: 
                0 3px 6px rgba(0, 0, 0, 0.06),
                0 6px 12px rgba(0, 0, 0, 0.04),
                0 9px 18px rgba(0, 0, 0, 0.03);

            --inset-shadow:
                inset 2px 2px 4px rgba(0, 0, 0, 0.06),
                inset -2px -2px 4px rgba(255, 255, 255, 0.7);

            --card-border: 1px solid var(--border);
            --card-border-muted: 1px solid var(--border-muted);

            --transition: all 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }}

        [data-theme="dark"] {{
              /* hsl (fallback color) */
            --bg-dark: hsl(215 100% 2%);
            --bg: hsl(206 93% 4%);
            --bg-light: hsl(203 64% 8%);
            --text: hsl(204 100% 95%);
            --text-muted: hsl(204 44% 69%);
            --highlight: hsl(203 33% 38%);
            --border: hsl(202 46% 27%);
            --border-muted: hsl(200 83% 15%);
            --primary: hsl(203 73% 68%);
            --secondary: hsl(25 66% 66%);
            --danger: hsl(9 31% 65%);
            --warning: hsl(52 22% 56%);
            --success: hsl(147 21% 58%);
            --info: hsl(217 34% 65%);

            --bg-header: hsla(206 93% 4%, 0.5);
            
            /* oklch */
            --bg-dark: oklch(0.1 0.03 237);
            --bg: oklch(0.15 0.03 237);
            --bg-light: oklch(0.2 0.03 237);
            --text: oklch(0.96 0.06 237);
            --text-muted: oklch(0.76 0.06 237);
            --highlight: oklch(0.5 0.06 237);
            --border: oklch(0.4 0.06 237);
            --border-muted: oklch(0.3 0.06 237);
            --primary: oklch(0.76 0.1 237);
            --secondary: oklch(0.76 0.1 57);
            --danger: oklch(0.7 0.06 30);
            --warning: oklch(0.7 0.06 100);
            --success: oklch(0.7 0.06 160);
            --info: oklch(0.7 0.06 260);

            --bg-header: oklch(0.15 0.03 237 / 0.5);
            --bg-header-element: oklch(0.2 0.03 237 / 0.75);

            --box-shadow: 
                0 1px 2px rgba(0, 0, 0, 0.5),
                0 2px 4px rgba(0, 0, 0, 0.4),
                0 4px 8px rgba(0, 0, 0, 0.3);

            --box-shadow-elevated: 
                0 12px 25px rgba(0, 0, 0, 0.35),
                0 18px 40px rgba(0, 0, 0, 0.25),
                0 25px 60px rgba(0, 0, 0, 0.2);

            --box-shadow-subtle: 
                0 4px 8px rgba(0, 0, 0, 0.2),
                0 8px 16px rgba(0, 0, 0, 0.15),
                0 12px 24px rgba(0, 0, 0, 0.1);

            --inset-shadow-dark:
                inset 2px 2px 4px rgba(0, 0, 0, 0.5),
                inset -2px -2px 4px rgba(255, 255, 255, 0.06);
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: var(--bg-dark);
            color: var(--text);
            line-height: 1.6;
            min-height: 100vh;
            padding: 2rem 1rem;
            transition: var(--transition);
        }}

        .container {{
            max-width: 95%;
            margin: 0 auto;
            margin-top: 2rem;
        }}

        .header {{
            text-align: center;
            margin: 2rem 0 3rem;
            padding: 0 1rem;
        }}

        .header h1 {{
            font-size: 2.8rem;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 0.5rem;
        }}

        .card {{
            background: var(--bg);
            box-shadow: var(--box-shadow);
            border-radius: 50px;
            overflow: visible;
            margin-bottom: 3rem;
            transition: var(--transition);
            position: relative;
            justify-content: center;
        }}

        .sticky-header {{
            position: sticky;
            top: 0;
            margin-left: auto;
            margin-right: auto;
            background: var(--bg);
            padding: 1.5rem 2rem;
            border-radius: 50px;
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            align-items: center;
            transition: var(--transition);
            overflow: hidden;
        }}

        .sticky-header.stuck {{
            width: 90%;
            box-shadow: var(--box-shadow);
            background: transparent;
            border: var(--card-border);
            border-radius: 50px;
            top: 2rem;
            z-index: 1;
        }}

        .header-bg-layer {{
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            background: var(--bg-header);
            pointer-events: none;
            backdrop-filter: blur(6px);
        }}

        .sticky-header > *:not(.header-bg-layer) {{
            z-index: 2;
        }}

        .search-box {{
            position: relative;
            color: var(--text-muted);
            height: 3rem;
            flex: 1;
        }}

        .search-box input {{
            width: 100%;
            height: 100%;
            padding: 0.8rem 1rem 0.8rem 2.5rem;
            border-radius: 40px;
            background: var(--bg-header-element);
            border: var(--card-border-muted);
            box-shadow: var(--box-shadow);
            color: var(--text);
            font-size: 0.95rem;
            transition: var(--transition);
        }}

        .search-box input:focus {{
            outline: none;
            border-color: var(--primary);
            box-shadow: var(--box-shadow-elevated) !important;
            transform: scale(1.05);
        }}

        .search-box i {{
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
        }}

        .file-info {{
            background: var(--bg-header-element);
            border-radius: 40px;
            padding: 1rem 2rem;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-size: 0.95rem;
            color: var(--text-muted);
            font-weight: 500;
            box-shadow: var(--box-shadow);
            border: var(--card-border-muted);
            height: 3rem;
            flex: 1;
        }}

        .file-info i {{
            font-size: 1.2rem;
            color: var(--text-muted);
        }}

        .theme-toggle, .density-toggle {{
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-header-element);
            color: var(--text-muted);
            box-shadow: var(--box-shadow);
            border: var(--card-border-muted);
            cursor: pointer;
            transition: var(--transition);
        }}

        .theme-toggle:hover, .density-toggle:hover {{
            box-shadow: var(--box-shadow-subtle);
            transform: translateY(-2px);
            border-color: var(--primary);
        }}

        .table-container {{
            overflow-x: auto;
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
            border-left: var(--card-border-muted);
            border-right: var(--card-border-muted);
            border-bottom: var(--card-border-muted);
            padding: 0.8rem 1rem;
            word-wrap: break-word;
            overflow-wrap: break-word;
            background: transparent;
            z-index: 0;
        }}

        thead tr:first-child th {{
            border-top: var(--card-border-muted);
        }}

        th:first-child, td:first-child {{
            border-left: none;
        }}

        th:last-child, td:last-child {{
            border-right: none;
        }}

        th {{
            background: var(--bg-dark);
            color: var(--text);
            font-weight: 600;
            text-align: center;
            border-bottom: var(--card-border);
            position: sticky;
            top: 0;
        }}

        tbody tr:nth-child(even) td {{
            background: var(--bg-light);
        }}

        tbody tr:hover td {{
            background: var(--highlight) !important;
        }}

        body[data-density="compact"] th,
        body[data-density="compact"] td {{
            padding: 0.5rem 0.8rem;
            font-size: 0.8rem;
            line-height: 1.4;
        }}

        footer {{
            text-align: center;
            margin-top: 2rem;
            color: var(--text);
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
            width: 4rem;
            height: 4rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary);
            color: var(--highlight);
            font-size: 1.4rem;
            box-shadow: var(--box-shadow);
            cursor: pointer;
            transition: var(--transition);
        }}

        .export-btn:hover {{
            transform: translateY(-5px) scale(1.05);
            box-shadow: var(--box-shadow-elevated);
        }}

        .export-options {{
            position: absolute;
            bottom: 75px;
            right: 0;
            background: var(--header-bg);
            backdrop-filter: blur(15px);
            border: var(--card-border-muted);
            border-radius: 20px;
            box-shadow: var(--box-shadow);
            padding: 12px;
            display: none;
            flex-direction: column;
            gap: 8px;
            min-width: 200px;
            transform-origin: bottom right;
            transition: var(--transition);
            animation: scaleIn 0.3s ease-out forwards;
            z-index: 101;
        }}

        .export-options button {{
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0.8rem 1rem;
            background: transparent;
            border: none;
            border-radius: 12px;
            color: var(--text);
            cursor: pointer;
            text-align: left;
            transition: var(--transition);
            font-size: 1rem;
            font-weight: 500;
        }}

        .export-options button:hover {{
            transition: none;
            background: var(--highlight);
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
            
            .sticky-header {{
                flex-direction: column;
                gap: 15px;
                align-items: stretch;
            }}
            
            .table-actions {{
                justify-content: space-between;
            }}

            th {{
                top: 90px; /* Adjust for mobile sticky header */
            }}
        }}
    </style>
</head>
<body data-density="compact"> <!-- DEFAULT COMPACT VIEW -->
    <div id="spinner" style="display:none; position:fixed; inset:0; background:rgba(255,255,255,0.7); z-index:2000; justify-content:center; align-items:center;">
        <div style="border: 4px solid rgba(0,0,0,0.1); border-top: 4px solid var(--primary); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
    </div>
    <style>
    @keyframes spin {{
        0% {{ transform: rotate(0deg); }}
        100% {{ transform: rotate(360deg); }}
    }}
    </style>
    <div class="container">
        <main>
            <div class="header">
                <h1>Markdown Table Viewer</h1>
            </div>
            <div class="card">
                <div class="sentinel"></div>
                <div class="sticky-header"> <!-- Sticky header element -->

                    <div class="header-bg-layer"></div>
                
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="tableSearch" placeholder="Search table content...">
                    </div>

                    <div class="file-info">
                        <i class="fas fa-file-alt"></i>
                        <span>Converted from: {md_file}</span>
                    </div>

                    <button class="theme-toggle" id="themeToggle">
                        <i class="fas fa-moon"></i>
                    </button>

                    <button class="density-toggle" id="densityToggle">
                        <i class="fas fa-expand-alt"></i> <!-- Changed to expand icon -->
                    </button>
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
            updateDensityIcon(compact ? 'normal' : 'compact');
        }});
        
        function updateThemeIcon(theme) {{
            themeToggle.innerHTML = theme === 'dark' 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        }}
        
        function updateDensityIcon(density) {{
            densityToggle.innerHTML = density === 'compact'
                ? '<i class="fas fa-expand-alt"></i>'
                : '<i class="fas fa-compress-alt"></i>';
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

        // Sticky header functionality
        const sentinel = document.querySelector('.sentinel');
        const sticky = document.querySelector('.sticky-header');
        const root = document.documentElement;

        const observer = new IntersectionObserver(
        ([entry]) => {{
            sticky.classList.toggle('stuck', !entry.isIntersecting);
        }},
        {{ threshold: [1.0] }}
        );

        observer.observe(sentinel);


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
            
            showNotification('CSV exported successfully!', 'success');
        }}
        
        function exportToPDF() {{
            const spinner = document.getElementById('spinner');
            spinner.style.display = 'flex';

            setTimeout(() => {{
                try {{
                    let rawMd = document.getElementById('original-md').textContent.trim();
                    const lines = rawMd.split('\\n').filter(line => line.trim().startsWith('|'));
                    
                    if (lines.length < 2) {{
                        throw new Error('Markdown table is invalid!');
                    }}
                    
                    // Parse header row
                    const parseRow = (line) => {{
                        return line
                            .trim()
                            .split('|')
                            .slice(1, -1)
                            .map(cell => cell.trim().replace(/<br\\s*\\/?>/gi, '\\n'));
                    }};
                    
                    const header = parseRow(lines[0]);
                    const colCount = header.length;
                    const body = [];
                    
                    // Process content rows (skip separator row at index 1)
                    for (let i = 2; i < lines.length; i++) {{
                        const row = parseRow(lines[i]);
                        
                        // Skip rows that don't match column count
                        if (row.length !== colCount) continue;
                        
                        // Handle category rows (single non-empty cell in first column)
                        if (row[0].trim() !== '' && row.slice(1).every(cell => cell.trim() === '')) {{
                            body.push([{{
                                content: row[0],
                                colSpan: colCount,
                                styles: {{
                                    fillColor: [240, 240, 240],
                                    textColor: [0, 0, 0],
                                    fontStyle: 'bold',
                                    halign: 'center',
                                    cellPadding: {{
                                        top: 6,
                                        right: 4,
                                        bottom: 6,
                                        left: 4
                                    }}
                                }}
                            }}]);
                        }} else {{
                            body.push(row);
                        }}
                    }}
                    
                    // Initialize PDF in landscape mode
                    const {{ jsPDF }} = window.jspdf;
                    const doc = new jsPDF('landscape', 'pt', 'a4');
                    
                    // Set PDF title from filename
                    const pdfTitle = "{pdf_title}";

                    // Add title in Typora style
                    doc.setFontSize(18);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(50, 50, 50);
                    doc.text(pdfTitle, 40, 40);
                    
                    // Add separator line under title
                    doc.setLineWidth(0.5);
                    doc.line(40, 50, 555, 50);
                    
                    // Generate table with Typora-like styling
                    doc.autoTable({{
                        head: [header],
                        body: body,
                        startY: 60,
                        theme: 'grid',
                        styles: {{
                            fontSize: 9,
                            cellPadding: {{
                                top: 6,
                                bottom: 6,
                                left: 5,
                                right: 5,
                            }},
                            overflow: 'linebreak',
                            valign: 'top',
                            lineColor: [200, 200, 200],
                            lineWidth: 0.3,
                            textColor: [34, 34, 34],
                            font: 'helvetica'
                        }},
                        headStyles: {{
                            fillColor: [230, 230, 230],
                            textColor: [0, 0, 0],
                            fontStyle: 'bold',
                            fontSize: 10,
                            halign: 'center',
                            valign: 'middle',
                            cellPadding: {{ top: 7, bottom: 7, left: 5, right: 5 }},
                            lineWidth: 0.3,
                            lineColor: [180, 180, 180],
                        }},
                        bodyStyles: {{
                            valign: 'top',
                            lineWidth: 0.2,
                            lineColor: [210, 210, 210],
                        }},
                        alternateRowStyles: {{
                            fillColor: [245, 245, 245]
                        }},
                        margin: {{ 
                            top: 10,
                            left: 35,
                            right: 35
                        }},
                        tableWidth: 'auto',
                        showHead: 'everyPage',
                        pageBreak: 'auto',
                        rowPageBreak: 'avoid',
                        tableLineWidth: 0.3,
                        didDrawCell: function(data) {{
                            doc.setDrawColor(220, 220, 220);
                            doc.setLineWidth(0.3);
                            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
                        }},
                        didParseCell: function(data) {{
                            if (data.row.section === 'body' && data.row.raw.length === 1) {{
                                data.cell.styles.fillColor = [235, 240, 250];
                                data.cell.styles.textColor = [0, 0, 70];
                                data.cell.styles.fontStyle = 'bold';
                                data.cell.styles.halign = 'center';
                            }}
                        }}
                    }});
                    
                    // Save PDF with filename-based name
                    doc.save(`${{pdfTitle}}.pdf`);
                    showNotification("PDF exported successfully!", "success");
                }} catch (error) {{
                    console.error("PDF export error:", error);
                    showNotification("PDF export failed: " + error.message, "error");
                }} finally {{
                    spinner.style.display = 'none';
                }}
            }}, 100);
        }}

        
        function copyToClipboard() {{
            const tableHTML = document.querySelector('.table-container').innerHTML;
            navigator.clipboard.writeText(tableHTML)
                .then(() => showNotification('HTML copied to clipboard!', 'success'))
                .catch(err => showNotification('Failed to copy: ' + err, 'error'));
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

        // Initialize density icon based on default compact view
        updateDensityIcon('compact');
    </script>
    <script id="original-md" type="text/plain">
        {original_md}
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