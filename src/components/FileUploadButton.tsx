import React, { useRef, useState } from 'react';
import { UploadCloud, X, Check, Loader2, Image as ImageIcon, Film, Music as MusicIcon, RefreshCw } from 'lucide-react';

interface FileUploadButtonProps {
  currentUrl?: string;
  onFileUploaded?: (url: string, fileInfo?: { name: string; size: number; mime: string }) => void;
  onUploadSuccess?: (url: string) => void;
  accept?: string;
  label?: string;
  helperText?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'any';
  compact?: boolean;
  className?: string;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  currentUrl,
  onFileUploaded,
  onUploadSuccess,
  accept = 'image/png,image/jpeg,image/webp,image/gif',
  label = 'Subir desde dispositivo',
  helperText,
  mediaType = 'image',
  compact = false,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewName, setPreviewName] = useState('');

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setPreviewName(file.name);
    setIsUploading(true);

    try {
      // Validate file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        throw new Error('El archivo excede el tamaño máximo permitido de 25MB.');
      }

      // Read as Data URL
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Error al leer el archivo en el dispositivo.'));
        reader.readAsDataURL(file);
      });

      // Send to server upload endpoint with instant fallback
      let finalUrl = dataUrl;
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: dataUrl,
            fileName: file.name,
            fileType: file.type
          })
        });

        if (response.ok) {
          const res = await response.json();
          if (res.success && res.url) {
            finalUrl = res.url;
          }
        }
      } catch {
        // Use client-side dataUrl fallback
        finalUrl = dataUrl;
      }

      onFileUploaded?.(finalUrl, { name: file.name, size: file.size, mime: file.type });
      onUploadSuccess?.(finalUrl);
    } catch (err: any) {
      console.error('File upload error:', err);
      setErrorMessage(err.message || 'Error al procesar el archivo adjunto.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileUploaded('');
    setPreviewName('');
    setErrorMessage('');
  };

  const isVideo = mediaType === 'video' || (currentUrl && (currentUrl.endsWith('.mp4') || currentUrl.endsWith('.webm')));
  const isAudio = mediaType === 'audio' || (currentUrl && (currentUrl.endsWith('.mp3') || currentUrl.endsWith('.wav') || currentUrl.endsWith('.aac')));

  if (compact) {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleSelectFile}
          className="hidden"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Subiendo...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentUrl ? 'Reemplazar archivo' : label}</span>
              </>
            )}
          </button>

          {currentUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition cursor-pointer"
              title="Eliminar archivo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {errorMessage && (
          <p className="text-[11px] text-red-400 font-medium">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleSelectFile}
        className="hidden"
      />

      {currentUrl ? (
        <div className="relative p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 overflow-hidden shadow-inner">
          <div className="flex items-center gap-3 min-w-0">
            {isVideo ? (
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Film className="w-6 h-6" />
              </div>
            ) : isAudio ? (
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <MusicIcon className="w-6 h-6" />
              </div>
            ) : (
              <img
                src={currentUrl}
                alt="Vista previa"
                className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-900 shrink-0"
              />
            )}

            <div className="min-w-0">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {previewName || 'Archivo adjunto guardado'}
              </span>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">{currentUrl}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
              title="Reemplazar archivo"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              ) : (
                <RefreshCw className="w-4 h-4 text-indigo-400" />
              )}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition active:scale-95 cursor-pointer"
              title="Quitar archivo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 hover:bg-slate-900/80 rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
        >
          {isUploading ? (
            <div className="py-2 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">Cargando archivo al servidor...</span>
            </div>
          ) : (
            <>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                {mediaType === 'video' ? (
                  <Film className="w-5 h-5" />
                ) : mediaType === 'audio' ? (
                  <MusicIcon className="w-5 h-5" />
                ) : (
                  <UploadCloud className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {label}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {helperText || 'Haz clic para seleccionar un archivo desde tu dispositivo (hasta 25MB)'}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
