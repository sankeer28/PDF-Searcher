let documents = [];
function updateFileLabel() {
    let fileInput = document.getElementById('fileUpload');
    let fileCount = fileInput.files.length;
    let label = fileCount === 0 ? 'Choose Files' : 'Selected Files: ' + fileCount;
    document.querySelector('.custom-file-upload').textContent = label;
}

document.getElementById('fileUpload').addEventListener('change', function() {
    updateFileLabel(); 
    let files = this.files;
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let reader = new FileReader();
        reader.onload = function() {
            pdfjsLib.getDocument({data: this.result}).promise.then(function(pdf) {
                let numPages = pdf.numPages;
                let promises = [];
                for (let j = 1; j <= numPages; j++) {
                    promises.push(pdf.getPage(j).then(function(page) {
                        return page.getTextContent().then(function(textContent) {
                            return textContent.items.map(function(item) { return item.str; }).join(' ');
                        });
                    }));
                }
                Promise.all(promises).then(function(texts) {
                    documents.push({name: file.name, text: texts.join('\n')});
                    document.getElementById('fileNames').textContent += file.name + '\n';
                });
            });
        };
        reader.readAsArrayBuffer(file);
    }
});

document.getElementById('caseSensitive').addEventListener('click', function() {
    this.classList.toggle('active');
    handleSearch(); 
});

function handleSearch() {
    let query = document.getElementById('searchQuery').value;
    let caseSensitive = document.getElementById('caseSensitive').classList.contains('active');
    let contextLength = parseInt(document.getElementById('contextLength').value);

    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    for (let i = 0; i < documents.length; i++) {
        let doc = documents[i];
        let pos;
        let start = 0;
        while (true) {
            if (caseSensitive) {
                pos = doc.text.indexOf(query, start);
            } else {
                pos = doc.text.toLowerCase().indexOf(query.toLowerCase(), start);
            }
            if (pos !== -1) {
                let contextStart = Math.max(0, pos - contextLength);
                let contextEnd = Math.min(doc.text.length, pos + query.length + contextLength);
                let resultText = doc.text.substring(contextStart, contextEnd);
                let regex = new RegExp(query, caseSensitive ? "" : "i");
                resultText = resultText.replace(regex, '<span class="highlight">$&</span>');
                let resultDiv = document.createElement('div');
                resultDiv.innerHTML = '<span class="bold">' + doc.name + ':</span> ' + resultText;
                resultsDiv.appendChild(resultDiv);
                start = pos + query.length; 
            } else {
                break;
            }
        }
    }
}


updateFileLabel();

document.getElementById('githubButton').addEventListener('click', function() {
    window.location.href = 'https://github.com/sankeer28/PDF-Searcher'; 
});

function setContainerWidth(width) {
    var container = document.getElementById('results');
    container.style.width = width;
    container.style.marginLeft = 'auto'; 
    container.style.marginRight = 'auto'; 
}



