// app/lib/fileParser.js
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

const MAX_TEXT_LENGTH = 8000;

export async function extractText(buffer, filename, mimeType) {
  try {
    const isPdf =
      mimeType === 'application/pdf' ||
      filename.toLowerCase().endsWith('.pdf');

    const isDocx =
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      filename.toLowerCase().endsWith('.docx');

    const isDoc =
      mimeType === 'application/msword' ||
      filename.toLowerCase().endsWith('.doc');

    if (isPdf) return await parsePdf(buffer);
    if (isDocx || isDoc) return await parseWord(buffer);

    return {
      text: '',
      success: false,
      error: `Unrecognised file type for "${filename}"`,
    };
  } catch (err) {
    return { text: '', success: false, error: err.message || 'Unknown parse error' };
  }
}

async function parsePdf(buffer) {
  try {
    if (!PDFParse) {
      throw new Error('PDFParse class not exported from pdf-parse library');
    }

    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = (result.text || '').trim();

    if (!text || text.length < 20) {
      return {
        text: '',
        success: false,
        error: 'PDF appears to be image-based (scanned). Text could not be extracted.',
      };
    }
    return { text: text.slice(0, MAX_TEXT_LENGTH), success: true };
  } catch (err) {
    return { text: '', success: false, error: `PDF parse failed: ${err.message}` };
  }
}

async function parseWord(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = (result.value || '').trim();

    if (!text || text.length < 20) {
      return {
        text: '',
        success: false,
        error: 'Word document appears to be empty or contains no readable text.',
      };
    }
    return { text: text.slice(0, MAX_TEXT_LENGTH), success: true };
  } catch (err) {
    return { text: '', success: false, error: `Word parse failed: ${err.message}` };
  }
}

export function extractCandidateName(text, filename) {
  if (text) {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 1 && l.length < 60);

    const nameLine = lines.find(
      (l) => !/[@\d]/.test(l) && l.split(' ').length <= 5
    );
    if (nameLine) return nameLine;
  }

  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[_\-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}