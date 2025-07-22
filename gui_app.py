import os
import webview
import json
import webbrowser
from pathlib import Path
import ctypes
import sys
from md_table_to_html import convert_markdown_table_to_html

try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)  # Per-monitor DPI aware
except Exception:
    pass

if getattr(sys, 'frozen', False):
    BASE_DIR = Path(sys._MEIPASS)
else:
    BASE_DIR = Path(__file__).parent.resolve()

HTML_FILE = BASE_DIR / "templates" / "index.html"
STATIC_DIR = BASE_DIR / "static"

class Api:
    def __init__(self, window):
        self.window = window
        self.input_path = ""
        self.output_path = ""

    def minimize_app(self):
        self.window.minimize()

    def close_app(self):
        self.window.destroy()

    def set_input_path(self, path):
        self.input_path = path

    def select_input_file(self):
        try:
            file = self.window.create_file_dialog(
                webview.OPEN_DIALOG,
                file_types=('Markdown Files (*.md)', 'All files (*.*)')
            )
            if file:
                self.input_path = file[0]
                return self.input_path
            return ""
        except Exception as e:
            print(f"Error selecting input file: {e}")
            return ""

    def select_output_folder(self):
        try:
            folder = self.window.create_file_dialog(webview.FOLDER_DIALOG)
            if folder:
                self.output_path = folder[0]
                return self.output_path
            return ""
        except Exception as e:
            print(f"Error selecting output folder: {e}")
            return ""

    def convert_table(self):
        try:
            if not self.input_path:
                return json.dumps({"status": "error", "message": "Please select a source file."})
            
            input_path = Path(self.input_path)
            output_path = Path(self.output_path)
            print(f"Input file: {input_path}, Output folder: {output_path}")
            output_file = output_path / f"{input_path.stem}.html"
            print(f"Output file: {output_file}")

            convert_markdown_table_to_html(input_path, output_file)
            webbrowser.open(f"file://{output_file.resolve()}")
            
            return json.dumps({
                "status": "success", 
                "message": f"Exported: {output_file.name}",
                "filePath": str(output_file.resolve())
            })
        except Exception as e:
            return json.dumps({"status": "error", "message": str(e)})
        
def resize_window(window):
    try:
        # Evaluate JS to get scaled dimensions
        dimensions = window.evaluate_js("""
            (function() {
                return {
                    width: document.body.scrollWidth * window.devicePixelRatio,
                    height: document.body.scrollHeight * window.devicePixelRatio
                };
            })();
        """)

        if dimensions:
            width = int(dimensions['width']) + 20
            height = int(dimensions['height']) + 40
            window.resize(width, height)
    except Exception as e:
        print(f"Window resize error: {e}")

def start_gui():
    # Ensure directories exist
    os.makedirs(BASE_DIR / "templates", exist_ok=True)
    os.makedirs(STATIC_DIR, exist_ok=True)
    
    # Create window with new dimensions
    window = webview.create_window(
        "Markdown Table Exporter", 
        url=f"file://{HTML_FILE}", 
        width=800,
        height=600,
        resizable=False,
        text_select=True,
        easy_drag=True,
    )
    
    # Create API with window reference
    api = Api(window)
    
    # Expose API functions
    window.expose(
        api.select_input_file,
        api.select_output_folder,
        api.convert_table,
        api.set_input_path,
        lambda: resize_window(window)
    )

    # Resize once the GUI has started
    webview.start(lambda: resize_window(window), debug=False)

if __name__ == "__main__":
    start_gui()