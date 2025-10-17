import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { cn } from "@/lib/utils";

interface CardImageUploadProps {
  currentImageUrl?: string;
  cardId: string;
  onImageUpload: (url: string) => void;
  onImageDelete: () => void;
}

export const CardImageUpload = ({
  currentImageUrl,
  cardId,
  onImageUpload,
  onImageDelete,
}: CardImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);
  const { uploadImage, deleteImage, isUploading, uploadProgress } = useImageUpload();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload file
    const uploadedUrl = await uploadImage(file, cardId);
    
    if (uploadedUrl) {
      onImageUpload(uploadedUrl);
      setPreviewUrl(uploadedUrl);
    } else {
      // Revert preview on error
      setPreviewUrl(currentImageUrl);
    }

    // Cleanup object URL
    URL.revokeObjectURL(objectUrl);
  };

  const handleRemove = async () => {
    if (currentImageUrl) {
      const success = await deleteImage(currentImageUrl);
      if (success) {
        setPreviewUrl(undefined);
        onImageDelete();
      }
    } else {
      setPreviewUrl(undefined);
      onImageDelete();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Imagem do Cavaleiro</label>
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-border",
          previewUrl ? "aspect-[3/4]" : "min-h-[300px]"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="relative w-full h-full group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClick}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Trocar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Arraste a imagem aqui ou clique para buscar
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              PNG, JPG ou WEBP (máx. 5MB)
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleClick}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Escolher Arquivo
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-xs text-muted-foreground text-center">
            Fazendo upload... {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
};
