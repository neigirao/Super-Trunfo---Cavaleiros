import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeHTML,
  isValidEmail,
  isValidLength,
  rateLimiter,
  validateCardInput,
  validateBattleInput,
  isValidUUID,
} from '../security';

describe('Security Utils', () => {
  describe('sanitizeHTML', () => {
    it('should sanitize dangerous HTML characters', () => {
      const dangerous = '<script>alert("XSS")</script>';
      const sanitized = sanitizeHTML(dangerous);
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('should handle multiple dangerous characters', () => {
      const input = '& < > " \' /';
      const expected = '&amp; &lt; &gt; &quot; &#x27; &#x2F;';
      expect(sanitizeHTML(input)).toBe(expected);
    });

    it('should not modify safe strings', () => {
      const safe = 'Hello World 123';
      expect(sanitizeHTML(safe)).toBe(safe);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });

    it('should reject overly long emails', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe('isValidLength', () => {
    it('should validate strings within range', () => {
      expect(isValidLength('hello', 1, 10)).toBe(true);
      expect(isValidLength('test', 4, 4)).toBe(true);
    });

    it('should reject strings outside range', () => {
      expect(isValidLength('hi', 3, 10)).toBe(false);
      expect(isValidLength('toolongstring', 1, 5)).toBe(false);
    });
  });

  describe('rateLimiter', () => {
    beforeEach(() => {
      rateLimiter.clear('test-action');
    });

    it('should allow actions within limit', () => {
      expect(rateLimiter.isAllowed('test-action', 3, 1000)).toBe(true);
      expect(rateLimiter.isAllowed('test-action', 3, 1000)).toBe(true);
      expect(rateLimiter.isAllowed('test-action', 3, 1000)).toBe(true);
    });

    it('should block actions over limit', () => {
      rateLimiter.isAllowed('test-action', 2, 1000);
      rateLimiter.isAllowed('test-action', 2, 1000);
      expect(rateLimiter.isAllowed('test-action', 2, 1000)).toBe(false);
    });

    it('should reset after time window', async () => {
      rateLimiter.isAllowed('test-action', 1, 100);
      expect(rateLimiter.isAllowed('test-action', 1, 100)).toBe(false);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(rateLimiter.isAllowed('test-action', 1, 100)).toBe(true);
    });
  });

  describe('validateCardInput', () => {
    it('should validate correct card data', () => {
      const result = validateCardInput({
        name: 'Hydrogen',
        knight_name: 'Sir Hydrogen',
        symbol: 'H',
        atomic_number: 1,
        atomic_mass: 1.008,
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid atomic number', () => {
      const result = validateCardInput({ atomic_number: 150 });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Número atômico');
    });

    it('should reject invalid atomic mass', () => {
      const result = validateCardInput({ atomic_mass: 500 });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Massa atômica');
    });

    it('should reject overly long names', () => {
      const result = validateCardInput({ name: 'a'.repeat(150) });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Nome do elemento');
    });
  });

  describe('validateBattleInput', () => {
    it('should validate correct battle data', () => {
      const result = validateBattleInput({
        selectedAttribute: 'atomic_number',
        cardId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid attributes', () => {
      const result = validateBattleInput({ selectedAttribute: 'invalid_attr' });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Atributo inválido');
    });

    it('should reject invalid card IDs', () => {
      const result = validateBattleInput({ cardId: 'not-a-uuid' });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('ID de carta inválido');
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456-42661417400g')).toBe(false);
    });
  });
});
