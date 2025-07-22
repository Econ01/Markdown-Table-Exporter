document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('source-btn').addEventListener('click', chooseSource);
    document.getElementById('output-btn').addEventListener('click', chooseOutput);
    document.getElementById('convert-btn').addEventListener('click', convert);
    document.getElementById('toggle-theme').addEventListener('click', toggleTheme);

    setupDragAndDrop();
    document.getElementById('convert-btn').disabled = true;
});

function chooseSource() {
    pywebview.api.select_input_file().then(path => {
        updateFileInfo('source-file', path || "No file selected");
        document.getElementById('convert-btn').disabled = !path;
        showToast(path ? "File selected: " + path : "No file selected");
    }).catch(error => {
        console.error('Error in chooseSource:', error);
        updateFileInfo('source-file', "Error: Could not select file");
        showToast("Error selecting file", true);
    });
}

function chooseOutput() {
    pywebview.api.select_output_folder().then(path => {
        updateFileInfo('export-folder', path || "Default: Same as source file");
        showToast(path ? "Export folder set" : "Default export folder used");
    }).catch(error => {
        console.error('Error in chooseOutput:', error);
        updateFileInfo('export-folder', "Error: Could not select folder");
        showToast("Error selecting folder", true);
    });
}

function convert() {
    const statusElement = document.getElementById('status');
    const linkElement = document.getElementById('file-link');
    const btn = document.getElementById('convert-btn');
    
    statusElement.innerHTML = `<div class="spinner"></div> Converting...`;
    statusElement.className = 'status-message';
    linkElement.className = 'hidden';
    btn.disabled = true;
    
    pywebview.api.convert_table().then(result => {
        const res = JSON.parse(result);
        if (res.status === "success") {
            statusElement.innerHTML = `<i class="fas fa-check-circle"></i> Conversion successful!`;
            statusElement.className = 'status-message status-success';
            linkElement.innerHTML = `<a class="file-link" href="file://${res.filePath}" target="_blank">
                <i class="fas fa-external-link-alt"></i> Open exported file
            </a>`;
            linkElement.className = '';
            btn.disabled = false;
            pywebview.api['<lambda>']();
            showToast("Conversion successful!");
        } else {
            handleError(statusElement, btn, res.message);
        }
    }).catch(error => {
        handleError(statusElement, btn, error);
    });
}

function updateFileInfo(elementId, text) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<i class="fas fa-check-circle"></i> <span>${text}</span>`;
    element.animate([{ transform: 'scale(0.95)', opacity: 0 }, { transform: 'scale(1.05)', opacity: 1 }, { transform: 'scale(1)', opacity: 1 }], { duration: 400 });
    pywebview.api['<lambda>']();
}

function handleError(statusElement, btn, message) {
    statusElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error: ${message}`;
    statusElement.className = 'status-message status-error';
    btn.disabled = false;
    showToast("Error: " + message, true);
}

/* Toast Notification */
function showToast(message, isError = false) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (isError) toast.style.background = '#c1121f';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => container.removeChild(toast), 3500);
}

/* Theme Toggle */
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    document.body.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
    const icon = document.querySelector('#toggle-theme i');
    icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

/* Drag & Drop */
function setupDragAndDrop() {
    const dragArea = document.getElementById('drag-area');
    dragArea.addEventListener('dragover', e => { e.preventDefault(); dragArea.classList.add('drag-over'); });
    dragArea.addEventListener('dragleave', () => dragArea.classList.remove('drag-over'));
    dragArea.addEventListener('drop', e => {
        e.preventDefault();
        dragArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.md')) {
            pywebview.api.set_input_path(file.path);
            updateFileInfo('source-file', file.path);
            document.getElementById('convert-btn').disabled = false;
            showToast("File loaded: " + file.name);
        } else {
            showToast("Invalid file type. Only .md allowed.", true);
        }
    });
}
