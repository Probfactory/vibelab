// ══════════════════════════════════════════════
//  VibeLab Image Validation & Resize Utilities
// ══════════════════════════════════════════════

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif'];

/**
 * Validate an image file for type and size.
 * @param {File} file
 * @param {Object} opts
 * @param {number} opts.maxSizeMB - Maximum file size in MB
 * @param {string[]} [opts.allowedTypes] - Allowed MIME types
 * @returns {{ valid: boolean, error?: string }}
 */
function validateImage(file, { maxSizeMB, allowedTypes }) {
  if (!file) return { valid: false, error: 'No file selected.' };

  const types = allowedTypes || ALLOWED_IMAGE_TYPES;
  if (!types.includes(file.type)) {
    return { valid: false, error: 'Only PNG, JPG, and GIF images are allowed.' };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File is too large. Maximum size is ${maxSizeMB}MB.` };
  }

  return { valid: true };
}

/**
 * Load a File/Blob as an HTMLImageElement.
 * @param {File|Blob} file
 * @returns {Promise<HTMLImageElement>}
 */
function _loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image.'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Resize an image to fit within maxWidth x maxHeight, preserving aspect ratio.
 * Returns the original file if already within bounds.
 * @param {File} file
 * @param {Object} opts
 * @param {number} opts.maxWidth
 * @param {number} opts.maxHeight
 * @param {number} [opts.quality=0.85] - JPEG quality (0-1)
 * @returns {Promise<Blob>}
 */
async function resizeImage(file, { maxWidth, maxHeight, quality }) {
  const q = quality || 0.85;
  const img = await _loadImage(file);
  const { naturalWidth: w, naturalHeight: h } = img;

  // Already within bounds — return original
  if (w <= maxWidth && h <= maxHeight) {
    URL.revokeObjectURL(img.src);
    return file;
  }

  // Calculate scaled dimensions
  const ratio = Math.min(maxWidth / w, maxHeight / h);
  const newW = Math.round(w * ratio);
  const newH = Math.round(h * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, newW, newH);
  URL.revokeObjectURL(img.src);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', q);
  });
}

/**
 * Resize an image to a square by center-cropping, then scaling down.
 * Used for profile avatars.
 * @param {File} file
 * @param {Object} opts
 * @param {number} opts.size - Target square dimension (e.g. 400)
 * @param {number} [opts.quality=0.85] - JPEG quality (0-1)
 * @returns {Promise<Blob>}
 */
async function resizeAvatar(file, { size, quality }) {
  const q = quality || 0.85;
  const img = await _loadImage(file);
  const { naturalWidth: w, naturalHeight: h } = img;

  // Center-crop to square
  const cropSize = Math.min(w, h);
  const sx = Math.round((w - cropSize) / 2);
  const sy = Math.round((h - cropSize) / 2);

  // Output size: use target or original if smaller
  const outSize = Math.min(size, cropSize);

  const canvas = document.createElement('canvas');
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, outSize, outSize);
  URL.revokeObjectURL(img.src);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', q);
  });
}

// ── Preset configs ──

const IMAGE_RULES = {
  avatar: { maxSizeMB: 6, maxDim: 400, quality: 0.85 },
  thumbnail: { maxSizeMB: 10, maxWidth: 2800, maxHeight: 2100, quality: 0.9 }
};
