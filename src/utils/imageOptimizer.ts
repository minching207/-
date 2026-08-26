/**
 * High-performance browser-side image optimization
 * Resizes large images to display-ready resolutions and compresses to lightweight WebP/JPEG
 */
export async function optimizeImageFile(file: File, maxDimension = 1200, quality = 0.78): Promise<string> {
  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;

      // Preserve SVGs and Animated GIFs without canvas compression
      if (isGif || isSvg) {
        resolve(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scaling
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        // High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for optimal compression
        try {
          let outData = canvas.toDataURL('image/webp', quality);
          // If still large (>280KB) and canvas is large, downscale slightly for safety
          if (outData.length > 380000) {
            outData = canvas.toDataURL('image/webp', quality * 0.85);
          }
          if (outData.startsWith('data:image/webp')) {
            resolve(outData);
            return;
          }
        } catch (e) {}

        let jpegData = canvas.toDataURL('image/jpeg', quality);
        if (jpegData.length > 380000) {
          jpegData = canvas.toDataURL('image/jpeg', quality * 0.85);
        }
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
export async function optimizeDataUrl(dataUrl: string, maxDimension = 1200, quality = 0.78): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.startsWith('data:image/gif') || dataUrl.startsWith('data:image/svg')) {
    return dataUrl;
  }
  // If dataUrl is small enough (< 150KB), return as is
  if (dataUrl.length < 200000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
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

