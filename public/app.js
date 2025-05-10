document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('convert-form');
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  const loading = document.getElementById('loading');

  let droppedFiles = [];

  const updateFileList = () => {
    fileList.innerHTML = '';
    droppedFiles.forEach((file, index) => {
      const li = document.createElement('li');
      const entry = document.createElement('div');
      entry.className = 'file-entry';

      const preview = document.createElement('img');
      const reader = new FileReader();
      reader.onload = e => preview.src = e.target.result;
      reader.readAsDataURL(file);

      const text = document.createElement('span');
      text.textContent = file.name;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '&times;';
      removeBtn.onclick = (e) => {
        e.preventDefault(); // Prevent form submission
        droppedFiles.splice(index, 1);
        updateFileList();
      };

      entry.appendChild(preview);
      entry.appendChild(text);
      li.appendChild(entry);
      li.appendChild(removeBtn);
      fileList.appendChild(li);
    });
  };

  // Event listeners
  dropArea.addEventListener('click', () => fileInput.click());

  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
  });

  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
  });

  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    droppedFiles = Array.from(e.dataTransfer.files);
    updateFileList();
  });

  fileInput.addEventListener('change', (e) => {
    droppedFiles = Array.from(e.target.files);
    updateFileList();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (droppedFiles.length === 0) {
      alert('Please select at least one image to convert.');
      return;
    }
    
    const formData = new FormData(form);
    droppedFiles.forEach(file => formData.append('images', file));

    loading.classList.add('visible');

    try {
      const response = await fetch('/convert', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const contentType = response.headers.get('Content-Type');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = contentType === 'application/zip' ? 'converted_images.zip' : 'converted_image.' + formData.get('format');
        link.click();
        URL.revokeObjectURL(link.href);
        droppedFiles = [];
        updateFileList();
      } else {
        alert('Failed to convert images: ' + (await response.text()));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      loading.classList.remove('visible');
    }
  });
});