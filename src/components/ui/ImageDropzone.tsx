import { useRef, useState, type DragEvent } from 'react';
import { ImageUp } from 'lucide-react';
import { MAX_IMAGE_MB } from '../../api/cloudinary';

interface ImageDropzoneProps {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
}

// Click or drag & drop to choose photos from the computer
export function ImageDropzone({ onFiles, multiple = false, disabled = false, label }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    onFiles(multiple ? Array.from(list) : [list[0]]);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    if (!disabled) handleFiles(event.dataTransfer.files);
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition disabled:cursor-not-allowed disabled:opacity-60 ${
          dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
        }`}
      >
        <ImageUp className="h-10 w-10 text-blue-600" aria-hidden />
        <span className="font-medium text-gray-900">
          {label ?? (multiple ? 'Elige fotos o arrástralas aquí' : 'Elige una foto o arrástrala aquí')}
        </span>
        <span className="text-xs text-gray-500">JPG, PNG o WEBP · máximo {MAX_IMAGE_MB} MB</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        hidden
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = ''; // allows choosing the same file again
        }}
      />
    </>
  );
}