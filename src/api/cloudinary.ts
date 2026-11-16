import axios from 'axios';

// Photos are uploaded straight from the browser to Cloudinary (unsigned upload preset).
// Cloudinary returns a public https URL, which is what our backend stores (EP 015 / EP 017).
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export const MAX_IMAGE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export type UploadFolder = 'rooms' | 'dni';

export function isUploadConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

// Client-side check before spending time on the upload
export function validateImageFile(file: File): string | undefined {
  if (!ALLOWED_TYPES.includes(file.type)) return `"${file.name}" no es JPG, PNG ni WEBP`;
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `"${file.name}" pesa más de ${MAX_IMAGE_MB} MB`;
  return undefined;
}

// Plain axios on purpose: our `api` client would add the JWT header, and Cloudinary must not get it
export async function uploadImage(
  file: File,
  folder: UploadFolder,
  onProgress?: (percent: number) => void,
): Promise<string> {
  if (!isUploadConfigured()) {
    throw new Error('Falta configurar VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET!);
  form.append('folder', `muvu/${folder}`);

  try {
    const { data } = await axios.post<{ secure_url: string }>(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      form,
      {
        timeout: 60000,
        onUploadProgress: (event) => {
          if (event.total) onProgress?.(Math.round((event.loaded * 100) / event.total));
        },
      },
    );
    return data.secure_url;
  } catch {
    throw new Error(`No se pudo subir "${file.name}". Revisa tu conexión e intenta de nuevo.`);
  }
}