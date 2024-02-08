import tkinter as tk
from tkinter import filedialog
from PyPDF2 import PdfFileReader

class Application(tk.Frame):
    def __init__(self, master=None):
        super().__init__(master)
        self.master = master
        self.pack()
        self.create_widgets()

    def create_widgets(self):
        self.upload = tk.Button(self)
        self.upload["text"] = "Upload PDFs"
        self.upload["command"] = self.upload_files
        self.upload.pack(side="top")

        self.filenames_label = tk.Label(self, text="")
        self.filenames_label.pack(side="top")

        self.search = tk.Entry(self)
        self.search.pack(side="top")

        self.caseSensitive = tk.IntVar()
        self.caseCheck = tk.Checkbutton(self, text="Case Sensitive", variable=self.caseSensitive)
        self.caseCheck.pack(side="top")

        self.results = tk.Text(self)
        self.results.pack(side="bottom")

        self.go = tk.Button(self)
        self.go["text"] = "Search"
        self.go["command"] = self.handle_search
        self.go.pack(side="top")

    def upload_files(self):
        self.filenames = filedialog.askopenfilenames(filetypes=(("PDF files", "*.pdf"), ("all files", "*.*")))
        self.documents = []
        for filename in self.filenames:
            with open(filename, 'rb') as f:
                pdf = PdfFileReader(f)
                text = ''
                for page in range(pdf.getNumPages()):
                    text += pdf.getPage(page).extractText()
                self.documents.append({'name': filename, 'text': text})
        self.filenames_label["text"] = "\n".join(self.filenames)

    def handle_search(self):
        query = self.search.get()
        caseSensitive = self.caseSensitive.get()

        resultsDiv = self.results
        resultsDiv.delete('1.0', tk.END)

        for doc in self.documents:
            text = doc['text']
            sentences = text.split('.')
            for sentence in sentences:
                if (caseSensitive and query in sentence) or (not caseSensitive and query.lower() in sentence.lower()):
                    result = 'Found in ' + doc['name'] + ': ' + sentence + '\n'
                    resultsDiv.insert(tk.END, result)

root = tk.Tk()
app = Application(master=root)
app.mainloop()
