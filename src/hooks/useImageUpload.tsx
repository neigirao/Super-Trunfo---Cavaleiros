import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { storageUtils } from "@/lib/storage";
import { toast } from "sonner";

interface UseImageUploadReturn {
  uploadImage: (file: File, cardId: string) => Promise<string | null>;
  deleteImage: (imageUrl: string) => Promise<boolean>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, cardId: string): Promise<string | null> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate image
      const validation = storageUtils.validateImage(file);
      if (!validation.valid) {
        setError(validation.error || 'Arquivo inválido');
        toast.error(validation.error);
        return null;
      }

      // Generate unique file path
      const filePath = storageUtils.generateCardImagePath(cardId, file.name);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('card-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(100);

      // Get public URL
      const publicUrl = storageUtils.getPublicUrl(data.path);
      
      toast.success('Imagem enviada com sucesso!');
      return publicUrl;

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer upload da imagem';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Check if it's a storage URL
      if (!storageUtils.isStorageUrl(imageUrl)) {
        return true; // External URLs don't need deletion
      }

      const filePath = storageUtils.extractPathFromUrl(imageUrl);
      if (!filePath) {
        throw new Error('Não foi possível extrair o caminho do arquivo');
      }

      const { error: deleteError } = await supabase.storage
        .from('card-images')
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('Imagem removida com sucesso!');
      return true;

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao remover imagem';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    uploadProgress,
    error
  };
};
