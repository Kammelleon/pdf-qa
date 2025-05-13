import { 
  ERROR_FILE_TOO_LARGE,
  ERROR_INVALID_FILENAME,
  ERROR_INVALID_PDF,
  FILE_TYPE 
} from '../constants';
import { MAX_FILE_SIZE } from '../settings';

/**
 * Validate filename (check for suspicious characters and double extensions)
 * 
 * @param {string} filename - The filename to validate
 * @returns {boolean} True if the filename is valid, false otherwise
 */
export const isValidFilename = (filename) => {
  // Check for suspicious characters or patterns in filename
  const invalidCharsRegex = /[<>:"/\\|?*\x00-\x1F]/;
  const hasInvalidChars = invalidCharsRegex.test(filename);

  // Check for double extensions (e.g., file.php.pdf)
  const hasDoubleExtension = filename.split('.').length > 2;

  return !hasInvalidChars && !hasDoubleExtension;
};

/**
 * Basic check for PDF header signature
 * 
 * @param {File} file - The file to check
 * @returns {Promise<boolean>} Promise resolving to true if the file has a valid PDF header, false otherwise
 */
export const checkPdfHeader = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      const arr = new Uint8Array(e.target.result);
      // Check for PDF header signature %PDF-
      const isPdf = arr.length > 4 && 
                    arr[0] === 0x25 && // %
                    arr[1] === 0x50 && // P
                    arr[2] === 0x44 && // D
                    arr[3] === 0x46 && // F
                    arr[4] === 0x2D;   // -
      resolve(isPdf);
    };
    reader.readAsArrayBuffer(file.slice(0, 5)); // Read just the first 5 bytes
  });
};

/**
 * Validate PDF file type
 * 
 * @param {string} fileType - The MIME type of the file
 * @returns {boolean} True if the file type is valid PDF, false otherwise
 */
export const isValidPdfType = (fileType) => {
  return fileType === FILE_TYPE;
};

/**
 * Validate file size
 * 
 * @param {number} fileSize - The size of the file in bytes
 * @returns {boolean} True if the file size is valid, false otherwise
 */
export const isValidFileSize = (fileSize) => {
  return fileSize <= MAX_FILE_SIZE;
};

/**
 * Comprehensive PDF file validation
 * 
 * @param {File} file - The file to validate
 * @returns {Promise<{isValid: boolean, error: string|null}>} Promise resolving to validation result
 */
export const validatePdfFile = async (file) => {
  if (!file) {
    return { isValid: false, error: null };
  }
  if (!isValidPdfType(file.type)) {
    return { isValid: false, error: 'Please select a valid PDF file' };
  }
  if (!isValidFileSize(file.size)) {
    return { isValid: false, error: ERROR_FILE_TOO_LARGE };
  }
  if (!isValidFilename(file.name)) {
    return { isValid: false, error: ERROR_INVALID_FILENAME };
  }
  try {
    const isPdf = await checkPdfHeader(file);
    if (!isPdf) {
      return { isValid: false, error: ERROR_INVALID_PDF };
    }
  } catch (error) {
    console.error('Error validating PDF:', error);
    return { isValid: false, error: ERROR_INVALID_PDF };
  }
  return { isValid: true, error: null };
};