const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',                                                    // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx']);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per file
const MAX_FILES = 50;
const MAX_TOTAL_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB total

/**
 * Validate a single file object from formData.
 * @param {File} file - Web File object
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFile(file) {
  if (!file || file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    // Fallback: check extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return {
        valid: false,
        error: `Unsupported format "${file.name}". Accepted: PDF, DOC, DOCX`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate a batch of files.
 * @param {File[]} files
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateBatch(files) {
  const errors = [];

  if (!files || files.length === 0) {
    return { valid: false, errors: ['At least one resume is required'] };
  }

  if (files.length > MAX_FILES) {
    return { valid: false, errors: [`Maximum ${MAX_FILES} resumes per batch`] };
  }

  let totalSize = 0;
  for (const file of files) {
    const result = validateFile(file);
    if (!result.valid) {
      errors.push(`${file.name}: ${result.error}`);
    }
    totalSize += file.size;
  }

  if (totalSize > MAX_TOTAL_SIZE_BYTES) {
    errors.push(`Total upload size exceeds 25MB limit`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize a filename to prevent path traversal.
 * @param {string} filename
 * @returns {string}
 */
export function sanitizeFilename(filename) {
  // Keep only the basename, strip any directory components
  return filename.replace(/[^a-zA-Z0-9._\-\s]/g, '_').slice(0, 200);
}