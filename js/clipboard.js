/**
 * Clipboard Integration Module
 * Handles multi-MIME rich HTML and plain text copying to the system clipboard
 * so users can paste directly into Outlook with 100% native formatting.
 */
export const ClipboardHelper = {
  /**
   * Copies rich HTML markup directly to clipboard
   */
  async copyRichHtml(htmlContent, plainTextFallback = '') {
    if (!navigator.clipboard || !window.ClipboardItem) {
      return this.fallbackCopyHtml(htmlContent);
    }

    try {
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([plainTextFallback || this.htmlToPlainText(htmlContent)], { type: 'text/plain' });
      
      const item = new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText
      });

      await navigator.clipboard.write([item]);
      return { success: true };
    } catch (err) {
      console.warn("Async clipboard API failed, attempting fallback:", err);
      return this.fallbackCopyHtml(htmlContent);
    }
  },

  /**
   * Copies subject line text to clipboard
   */
  async copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return { success: true };
      } catch (err) {
        console.warn("Async clipboard writeText failed, attempting execCommand fallback:", err);
      }
    }
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    let successful = false;
    try {
      successful = document.execCommand('copy');
    } catch (err) {
      console.error('execCommand copy failed:', err);
    }
    document.body.removeChild(textArea);
    return { success: successful };
  },

  /**
   * Fallback using hidden contenteditable container
   */
  fallbackCopyHtml(htmlContent) {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    let successful = false;
    try {
      successful = document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy command failed:', err);
    }

    selection.removeAllRanges();
    document.body.removeChild(container);
    return { success: successful };
  },

  /**
   * Converts HTML markup to clean plain text summary
   */
  htmlToPlainText(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }
};
