document.addEventListener('DOMContentLoaded', function() {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');

    // Function to convert Markdown to HTML
    function markdownToHtml(markdown) {
        // Replace headings
        let html = markdown
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // Replace bold and italic
        html = html
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\_\_(.*?)\_\_/g, '<strong>$1</strong>')
            .replace(/\_(.*?)\_/g, '<em>$1</em>');

        // Replace links
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

        // Replace images
        html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');

        // Replace code blocks
        html = html.replace(/```([\s\S]*?)```/g, function(match, code) {
            return '<pre><code>' + code.trim() + '</code></pre>';
        });

        // Replace inline code
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');

        // Replace horizontal rule
        html = html.replace(/^\-\-\-$/gm, '<hr>');

        // Replace blockquotes
        html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

        // Replace unordered lists
        html = html.replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>');
        html = html.replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>');
        
        // Replace ordered lists
        html = html.replace(/^\d+\. (.*$)/gm, '<ol><li>$1</li></ol>');

        // Fix for adjacent list items (combine them)
        html = html
            .replace(/<\/ul>\s*<ul>/g, '')
            .replace(/<\/ol>\s*<ol>/g, '');

        // Replace paragraphs (any line that's not a special element)
        // First, split into lines and process each line
        const lines = html.split('\n');
        let inParagraph = false;
        
        for (let i = 0; i < lines.length; i++) {
            // Skip if line is empty or already contains HTML tags
            if (lines[i].trim() === '' || lines[i].match(/^<.*>$/)) {
                if (inParagraph) {
                    lines[i-1] += '</p>';
                    inParagraph = false;
                }
                continue;
            }
            
            // If line doesn't start with a tag, wrap in paragraph
            if (!lines[i].match(/^<.*>/)) {
                if (!inParagraph) {
                    lines[i] = '<p>' + lines[i];
                    inParagraph = true;
                }
                // If this is the last line and we're in a paragraph
                if (i === lines.length - 1 && inParagraph) {
                    lines[i] += '</p>';
                }
            } else if (inParagraph) {
                lines[i-1] += '</p>';
                inParagraph = false;
            }
        }
        
        return lines.join('\n');
    }

    // Function to update preview
    function updatePreview() {
        const markdown = editor.value;
        const html = markdownToHtml(markdown);
        preview.innerHTML = html;
    }

    // Listen for input in the editor
    editor.addEventListener('input', updatePreview);

    // Initial sample text
    editor.value = `# Welcome to the Markdown Editor

## How to use
1. Type or paste your Markdown text in the left panel
2. See the rendered output in the right panel

## Supported Markdown features
* **Bold text** using **double asterisks**
* *Italic text* using *single asterisks*
* [Links](https://example.com)
* Images: ![Alt text](https://via.placeholder.com/150)
* Headers (H1, H2, H3)
* Lists (ordered and unordered)
* Code blocks:
\`\`\`
function example() {
  console.log("Hello world!");
}
\`\`\`
* Inline \`code\` with backticks
* > Blockquotes
* Horizontal rules with ---

Try editing this text to see the changes in real-time!`;

    // Initial render
    updatePreview();
});