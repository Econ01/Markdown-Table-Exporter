import os
import webview
import json
import webbrowser
from pathlib import Path
import ctypes
import sys
import threading
import time
from md_table_to_html import convert_markdown_table_to_html

# Enable DPI awareness for Windows
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)
except Exception:
    pass

# Determine base directory
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
        self.conversion_in_progress = False

    def minimize_app(self):
        """Minimize the application window"""
        try:
            self.window.minimize()
        except Exception as e:
            print(f"Error minimizing window: {e}")

    def close_app(self):
        """Close the application"""
        try:
            self.window.destroy()
        except Exception as e:
            print(f"Error closing window: {e}")

    def get_app_info(self):
        """Get application information"""
        return json.dumps({
            "version": "2.0.0",
            "author": "Your Name",
            "description": "Modern Markdown Table to HTML Converter"
        })

    def validate_markdown_file(self, file_path):
        """Validate if the markdown file contains a valid table"""
        try:
            if not file_path or not Path(file_path).exists():
                return False, "File does not exist"
            
            if not file_path.lower().endswith('.md'):
                return False, "File must be a .md (Markdown) file"
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for table presence
            lines = content.splitlines()
            table_lines = [line for line in lines if line.strip().startswith('|')]
            
            if len(table_lines) < 2:
                return False, "No valid markdown table found in file"
            
            # Basic table structure validation
            if not any('|' in line and line.count('|') >= 2 for line in table_lines[:2]):
                return False, "Invalid table structure"
            
            return True, "Valid markdown table found"
            
        except Exception as e:
            return False, f"Error reading file: {str(e)}"

    def get_file_info(self, file_path):
        """Get detailed file information"""
        try:
            if not file_path or not Path(file_path).exists():
                return json.dumps({"error": "File not found"})
            
            file_path = Path(file_path)
            stat = file_path.stat()
            
            # Count lines and table rows
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            table_lines = [line for line in lines if line.strip().startswith('|')]
            
            info = {
                "name": file_path.name,
                "size": stat.st_size,
                "size_formatted": self._format_file_size(stat.st_size),
                "total_lines": len(lines),
                "table_rows": len(table_lines) - 2 if len(table_lines) >= 2 else 0,  # Exclude header and separator
                "modified": time.ctime(stat.st_mtime),
                "path": str(file_path.parent)
            }
            
            return json.dumps(info)
            
        except Exception as e:
            return json.dumps({"error": str(e)})

    def _format_file_size(self, size_bytes):
        """Format file size in human readable format"""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.1f} KB"
        else:
            return f"{size_bytes / (1024 * 1024):.1f} MB"

    def set_input_path(self, path):
        """Set input file path with validation"""
        try:
            if not path:
                self.input_path = ""
                return json.dumps({"status": "error", "message": "No path provided"})
            
            is_valid, message = self.validate_markdown_file(path)
            if is_valid:
                self.input_path = path
                return json.dumps({"status": "success", "message": message, "path": path})
            else:
                self.input_path = ""
                return json.dumps({"status": "error", "message": message})
                
        except Exception as e:
            return json.dumps({"status": "error", "message": str(e)})

    def select_input_file(self):
        """Select input markdown file with improved error handling"""
        try:
            file = self.window.create_file_dialog(
                webview.OPEN_DIALOG,
                directory=str(Path.home()),
                file_types=('Markdown Files (*.md)', 'All files (*.*)')
            )
            
            if file and len(file) > 0:
                selected_file = file[0]
                is_valid, message = self.validate_markdown_file(selected_file)
                
                if is_valid:
                    self.input_path = selected_file
                    return json.dumps({
                        "status": "success", 
                        "path": selected_file,
                        "message": message
                    })
                else:
                    return json.dumps({
                        "status": "error", 
                        "message": message
                    })
            else:
                return json.dumps({
                    "status": "cancelled", 
                    "message": "No file selected"
                })
                
        except Exception as e:
            print(f"Error selecting input file: {e}")
            return json.dumps({
                "status": "error", 
                "message": f"Failed to select file: {str(e)}"
            })

    def select_output_folder(self):
        """Select output folder with better defaults"""
        try:
            # Default to input file directory if available
            default_dir = str(Path.home())
            if self.input_path:
                default_dir = str(Path(self.input_path).parent)
            
            folder = self.window.create_file_dialog(
                webview.FOLDER_DIALOG,
                directory=default_dir
            )
            
            if folder and len(folder) > 0:
                self.output_path = folder[0]
                return json.dumps({
                    "status": "success",
                    "path": self.output_path,
                    "message": "Output folder selected"
                })
            else:
                return json.dumps({
                    "status": "cancelled",
                    "message": "No folder selected"
                })
                
        except Exception as e:
            print(f"Error selecting output folder: {e}")
            return json.dumps({
                "status": "error",
                "message": f"Failed to select folder: {str(e)}"
            })

    def convert_table(self):
        """Convert markdown table to HTML with progress tracking"""
        if self.conversion_in_progress:
            return json.dumps({
                "status": "error", 
                "message": "Conversion already in progress"
            })
        
        try:
            if not self.input_path:
                return json.dumps({
                    "status": "error", 
                    "message": "Please select a source file first"
                })
            
            # Validate file again before conversion
            is_valid, validation_message = self.validate_markdown_file(self.input_path)
            if not is_valid:
                return json.dumps({
                    "status": "error", 
                    "message": validation_message
                })
            
            input_path = Path(self.input_path)
            
            # Determine output path
            if self.output_path:
                output_dir = Path(self.output_path)
            else:
                output_dir = input_path.parent
            
            output_file = output_dir / f"{input_path.stem}.html"
            
            print(f"Converting: {input_path} -> {output_file}")
            
            # Set conversion flag
            self.conversion_in_progress = True
            
            # Perform conversion
            convert_markdown_table_to_html(input_path, output_file)
            
            # Open the converted file
            webbrowser.open(f"file://{output_file.resolve()}")
            
            return json.dumps({
                "status": "success", 
                "message": f"Successfully exported: {output_file.name}",
                "filePath": str(output_file.resolve()),
                "fileName": output_file.name
            })
            
        except Exception as e:
            print(f"Conversion error: {e}")
            return json.dumps({
                "status": "error", 
                "message": f"Conversion failed: {str(e)}"
            })
        finally:
            self.conversion_in_progress = False

    def get_conversion_status(self):
        """Get current conversion status"""
        return json.dumps({
            "in_progress": self.conversion_in_progress,
            "has_input": bool(self.input_path),
            "has_output": bool(self.output_path)
        })

def create_window():
    """Create the main application window with optimal settings"""
    
    # Ensure required directories exist
    os.makedirs(BASE_DIR / "templates", exist_ok=True)
    os.makedirs(STATIC_DIR, exist_ok=True)
    
    # Create window with supported parameters only
    window = webview.create_window(
        title="Markdown Table Exporter",
        url=f"file://{HTML_FILE}",
        width=560,
        height=780,
        resizable=True,
        text_select=False
    )
    
    return window

def start_gui():
    """Start the GUI application"""
    try:
        window = create_window()
        api = Api(window)
        
        # Expose API functions to JavaScript
        window.expose(
            api.select_input_file,
            api.select_output_folder,
            api.convert_table,
            api.set_input_path,
            api.get_file_info,
            api.validate_markdown_file,
            api.get_conversion_status,
            api.get_app_info,
            api.minimize_app,
            api.close_app
        )
        
        # Start the webview
        webview.start(debug=False)
        
    except Exception as e:
        print(f"Failed to start GUI: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_gui()