import { supabase } from "@/integrations/supabase/client";

export const storageUtils = {
  /**
   * Get public URL for a storage file path
   */
  getPublicUrl: (path: string): string => {
    const { data } = supabase.storage.from('card-images').getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Extract file path from a Supabase storage URL
   */
  extractPathFromUrl: (url: string): string | null => {
    if (!url) return null;
    
    const match = url.match(/card-images\/(.+)$/);
    return match ? match[1] : null;
  },

  /**
   * Generate unique path for card image
   */
  generateCardImagePath: (cardId: string, fileName: string): string => {
    const timestamp = Date.now();
    const extension = fileName.split('.').pop()?.toLowerCase() || 'png';
    return `cards/${cardId}-${timestamp}.${extension}`;
  },

  /**
   * Check if URL is from Supabase storage
   */
  isStorageUrl: (url: string): boolean => {
    return url.includes('supabase.co/storage/v1/object/public/card-images');
  },

  /**
   * Validate image file
   */
  validateImage: (file: File): { valid: boolean; error?: string } => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato inválido. Use PNG, JPG ou WEBP.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Tamanho máximo: 5MB.'
      };
    }

    return { valid: true };
  }
};
