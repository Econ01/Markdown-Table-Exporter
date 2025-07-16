# 🧩 Markdown Table to Modern HTML Converter

**Convert Markdown tables into modern, responsive, interactive HTML documents.**

This Python-based tool takes a `.md` file containing a Markdown table and transforms it into a beautifully styled, self-contained `.html` file. The exported HTML includes responsive design, dark/light mode switching, export options (CSV, PDF, HTML), and category row styling — all without needing any backend server.

---

## 🌟 Features

- ✅ Supports standard GitHub-style Markdown tables
- ✅ Fully styled and responsive HTML output
- ✅ Automatic **dark/light mode** with persistent toggle
- ✅ Export table as:  
    - CSV file  
    - PDF file (with headers and alternate row colors)  
    - Copyable HTML snippet
- ✅ Auto-detects **category rows** (first cell with text, rest empty)
- ✅ Responsive for mobile and desktop
- ✅ Modern look and feel using only embedded CSS and JS
- ✅ Supports `<br>` inside Markdown cells
- ✅ Lightweight and offline-capable
- ✅ No external build steps — just run the Python script!

---

## 🔧 How It Works

1. You write a Markdown file (`input.md`) that contains a table.
2. This script scans for the first Markdown table in that file.
3. It parses the table, recognizes category rows, processes content, and escapes HTML.
4. The script wraps the processed table into a stylish, standalone HTML file (`output.html`) with embedded:
- CSS styles
- JavaScript for UI behavior and export
- Theme toggles and export options

---

## 📸 Preview

<table><tr><td>

https://user-images.githubusercontent.com/yourusername/preview-dark.png

</td><td>

https://user-images.githubusercontent.com/yourusername/preview-light.png

</td></tr></table>

---

## 📦 Installation

### Requirements

- Python 3.6+
- No third-party packages required

---

## 🚀 Usage

### 1. Save your Markdown file with a table

```markdown
| Name     | Age | Country |
|----------|-----|---------|
| John     | 25  | USA     |
| Jane     | 30  | Canada  |
|          |     |         |
| Engineers |     |         |
| Alice    | 27  | Germany |
| Bob      | 29  | UK      |
```

### 2. Run the script

```bash
python md_table_to_html.py input.md output.html
```
- `input.md`: Path to your Markdown file containing a table.
- `output.html`: Name of the file to export the styled HTML table into.

### 3. Open the generated `output.html` in your browser

Explore:
- 🌗 Toggle between Light and Dark Mode
- 📉 Export as CSV, PDF, or copy HTML
- 📱 Enjoy responsive layout on any screen size

---

## ✏️ Markdown Table Format Notes

- The script uses the **first Markdown table** in the file.
- Category rows are detected when:
    - The **first cell** of a row contains text
    - All other cells in that row are empty
- Supports `<br>` inside cells as line breaks.

---

## 🧪 Example

### `example.md`

```markdown
| Command      | Description          |
|--------------|----------------------|
|              |                      |
| General      |                      |
| FF 01 00 00 00 FE | Check TAB Connection |
| FF 02 00 00 00 FD | Reset Module        |
```

### Result

- "General" will be rendered as a **category header row**
- The other rows will be rendered as standard data rows

---

## 💡 Customization Tips

- Modify colors, shadows, and fonts in the embedded `<style>` section
- Adjust table layout responsiveness by editing the `min-width`, `padding`, or `font-size`- Export buttons use Font Awesome icons via CDN

---

## 🧰 Developer Notes

- No external JS libraries except:
    - [`jspdf`](https://cdnjs.com/libraries/jspdf)
    - [`jspdf-autotable`](https://cdnjs.com/libraries/jspdf-autotable)
    - [`Font Awesome`](https://cdnjs.com/libraries/font-awesome)
- Designed to be **self-contained** and easy to deploy or embed

---

## 📂 Project Structure

```text

.
├── md_table_to_html.py   # Main Python script
├── input.md              # Your Markdown file (you provide)
├── output.html           # Resulting HTML file (auto-generated)
```

---

## 👨‍💻 Author

**Ali Cem Çakmak**
🔗 [GitHub](https://github.com/Econ01)

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE).

---

## 🏁 Final Words

This project was built out of the need to turn boring Markdown tables into beautifully presented, export-ready documents for reports, logs, technical specs, and more — all without using bloated web frameworks or plugins.Happy exporting! 🎉
