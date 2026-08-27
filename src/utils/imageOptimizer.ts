/**
 * High-performance browser-side image optimization
 * Resizes large images to display-ready resolutions while preserving ultra-crisp detail for long detail pages
 */
export async function optimizeImageFile(
  file: File, 
  maxWidth = 1920, 
  quality = 0.88
): Promise<string> {
  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;

      // Preserve SVGs and Animated GIFs without canvas re-compression
      if (isGif || isSvg) {
        resolve(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Detail Page Friendly Scaling:
        // Detail page images are often very tall (e.g., width 860px, height 8000px).
        // We constrain by width (maxWidth = 1920) rather than general maxDimension,
        // so tall detail images will never be crushed into low-resolution strips!
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // Cap extreme canvas memory if height exceeds 16384px (browser canvas limits)
        if (height > 16000) {
          width = Math.round((width * 16000) / height);
          height = 16000;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        // High quality image smoothing for crisp text and typography
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for optimal clarity and small payload
        try {
          const outData = canvas.toDataURL('image/webp', quality);
          if (outData.startsWith('data:image/webp') && outData.length > 100) {
            resolve(outData);
            return;
          }
        } catch (e) {}

        const jpegData = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegData);
      };

      img.onerror = () => {
        resolve(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Optimizes an existing base64 dataUrl if it's overly large
 */
export async function optimizeDataUrl(
  dataUrl: string, 
  maxWidth = 1920, 
  quality = 0.88
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.startsWith('data:image/gif') || dataUrl.startsWith('data:image/svg')) {
    return dataUrl;
  }
  // If dataUrl is already modest in size (< 350KB), return as is
  if (dataUrl.length < 350000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      if (height > 16000) {
        width = Math.round((width * 16000) / height);
        height = 16000;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const webpData = canvas.toDataURL('image/webp', quality);
        if (webpData.startsWith('data:image/webp')) {
          resolve(webpData);
          return;
        }
      } catch (e) {}

      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

