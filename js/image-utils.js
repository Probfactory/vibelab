// ══════════════════════════════════════════════
//  VibeLab Image Validation & Compression Utils
// ══════════════════════════════════════════════

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

// ── Dynamic CDN loader for browser-image-compression ──

let _compressionLib = null;

async function _loadCompressionLib() {
  if (_compressionLib) return _compressionLib;
  if (window.imageCompression) {
    _compressionLib = window.imageCompression;
    return _compressionLib;
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js';
    script.onload = () => {
      _compressionLib = window.imageCompression;
      resolve(_compressionLib);
    };
    script.onerror = () => reject(new Error('Failed to load image compression library'));
    document.head.appendChild(script);
  });
}

// ── WebP support detection ──

let _webpSupported = null;

function _supportsWebP() {
  if (_webpSupported !== null) return _webpSupported;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  _webpSupported = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  return _webpSupported;
}

function _outputType() {
  return _supportsWebP() ? 'image/webp' : 'image/jpeg';
}

// ── Validation ──

function validateImage(file, { maxSizeMB, allowedTypes }) {
  if (!file) return { valid: false, error: 'No file selected.' };

  const types = allowedTypes || ALLOWED_IMAGE_TYPES;
  if (!types.includes(file.type)) {
    return { valid: false, error: 'Only PNG, JPG, GIF, and WebP images are allowed.' };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File is too large. Maximum size is ${maxSizeMB}MB.` };
  }

  return { valid: true };
}

// ── Core compression ──

async function compressImage(file, { maxSizeMB, maxWidthOrHeight, quality }) {
  const compress = await _loadCompressionLib();
  return compress(file, {
    maxSizeMB: maxSizeMB || 1,
    maxWidthOrHeight: maxWidthOrHeight || 2048,
    useWebWorker: true,
    fileType: _outputType(),
    initialQuality: quality || 0.8,
  });
}

// ── Helpers ──

function _loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image.'));
    img.src = URL.createObjectURL(file);
  });
}

// ── Public resize functions (same signatures as before) ──

async function resizeImage(file, { maxWidth, maxHeight, quality }) {
  return compressImage(file, {
    maxSizeMB: IMAGE_RULES.thumbnail.targetMB,
    maxWidthOrHeight: Math.max(maxWidth, maxHeight),
    quality: quality || 0.8,
  });
}

async function resizeAvatar(file, { size, quality }) {
  const q = quality || 0.8;
  const img = await _loadImage(file);
  const { naturalWidth: w, naturalHeight: h } = img;

  // Center-crop to square
  const cropSize = Math.min(w, h);
  const sx = Math.round((w - cropSize) / 2);
  const sy = Math.round((h - cropSize) / 2);

  const outSize = Math.min(size, cropSize);

  const canvas = document.createElement('canvas');
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, outSize, outSize);
  URL.revokeObjectURL(img.src);

  // Convert canvas to blob, then compress with library
  const cropped = await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });

  return compressImage(cropped, {
    maxSizeMB: IMAGE_RULES.avatar.targetMB,
    maxWidthOrHeight: outSize,
    quality: q,
  });
}

async function compressBanner(file) {
  return compressImage(file, {
    maxSizeMB: IMAGE_RULES.banner.targetMB,
    maxWidthOrHeight: IMAGE_RULES.banner.maxWidth,
    quality: IMAGE_RULES.banner.quality,
  });
}

// ── Preset configs ──

const IMAGE_RULES = {
  avatar:    { maxSizeMB: 6, maxDim: 400, quality: 0.8, targetMB: 0.5 },
  thumbnail: { maxSizeMB: 10, maxWidth: 2800, maxHeight: 2100, quality: 0.8, targetMB: 1 },
  banner:    { maxSizeMB: 10, maxWidth: 1600, maxHeight: 900, quality: 0.8, targetMB: 1 },
};
