/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export const sanitizeHTML = (input: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  const reg = /[&<>"'/]/gi;
  return input.replace(reg, (match) => map[match]);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate string length
 */
export const isValidLength = (
  input: string,
  min: number,
  max: number
): boolean => {
  return input.length >= min && input.length <= max;
};

/**
 * Rate limiter for client-side actions
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  /**
   * Check if action is allowed
   * @param key Unique identifier for the action
   * @param maxAttempts Maximum number of attempts allowed
   * @param windowMs Time window in milliseconds
   */
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the time window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }

  /**
   * Clear rate limit for a key
   */
  clear(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Validate card data input
 */
export const validateCardInput = (data: {
  name?: string;
  knight_name?: string;
  symbol?: string;
  atomic_number?: number;
  atomic_mass?: number;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (data.name && !isValidLength(data.name, 1, 100)) {
    errors.push('Nome do elemento deve ter entre 1 e 100 caracteres');
  }

  if (data.knight_name && !isValidLength(data.knight_name, 1, 100)) {
    errors.push('Nome do cavaleiro deve ter entre 1 e 100 caracteres');
  }

  if (data.symbol && !isValidLength(data.symbol, 1, 5)) {
    errors.push('Símbolo deve ter entre 1 e 5 caracteres');
  }

  if (data.atomic_number !== undefined && (data.atomic_number < 1 || data.atomic_number > 118)) {
    errors.push('Número atômico deve estar entre 1 e 118');
  }

  if (data.atomic_mass !== undefined && (data.atomic_mass < 0 || data.atomic_mass > 300)) {
    errors.push('Massa atômica deve estar entre 0 e 300');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate battle input
 */
export const validateBattleInput = (data: {
  selectedAttribute?: string;
  cardId?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  const validAttributes = [
    'atomic_number',
    'atomic_mass',
    'electronegativity',
    'density',
    'melting_point',
    'reactivity',
  ];

  if (data.selectedAttribute && !validAttributes.includes(data.selectedAttribute)) {
    errors.push('Atributo inválido selecionado');
  }

  if (data.cardId && !isValidUUID(data.cardId)) {
    errors.push('ID de carta inválido');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Secure random string generator
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
