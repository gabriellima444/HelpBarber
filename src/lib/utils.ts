import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Redimensiona e comprime uma imagem em Base64 para garantir que caiba no limite de 1MB do Firestore.
 */
export async function compressAndResizeImage(base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      // Retorna em JPEG com 70% de qualidade para reduzir drasticamente o tamanho em bytes
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => {
      reject(new Error('Falha ao carregar a imagem para compressão. Verifique se o arquivo é uma imagem válida.'));
    };
  });
}
