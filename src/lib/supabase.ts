import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20 &&
    !supabaseUrl.includes('your-project-id')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

/**
 * Storage upload helper for Supabase Storage with graceful local fallback
 */
export async function uploadToStorage(
  bucket: string,
  path: string,
  file: File | Blob
): Promise<{ url: string | null; error: string | null }> {
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true
      });
      if (error) {
        return { url: null, error: error.message };
      }
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return { url: publicData.publicUrl, error: null };
    } catch (err: any) {
      return { url: null, error: err.message || 'Error en subida a Supabase Storage' };
    }
  }

  // Fallback to local server endpoint
  try {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: reader.result,
              fileName: path.split('/').pop() || 'upload.png',
              fileType: file.type || 'image/png'
            })
          });
          const result = await res.json();
          if (res.ok && result.url) {
            resolve({ url: result.url, error: null });
          } else {
            resolve({ url: null, error: result.error || 'Error al subir archivo' });
          }
        } catch (e: any) {
          resolve({ url: null, error: e.message || 'Fallo de red en subida' });
        }
      };
      reader.readAsDataURL(file);
    });
  } catch (err: any) {
    return { url: null, error: err.message };
  }
}
