import { describe, expect, it } from 'vitest';

import { sanitizeValue } from '../src/index.js';

type Foo = {
  friends: Array<{
    name: string;
    status: 'family' | 'friend' | 'unknown';
  }>;
  user: {
    age: number;
    name: string;
  };
};

describe('sanitizeValue', () => {
  describe('when value is a string', () => {
    const input: string = 'Hello World';

    it('returns the string when no sanitizer provided', () => {
      expect(sanitizeValue(input)).toBe(input);
    });

    it('redacts a string', () => {
      expect(sanitizeValue(input, () => '[REDACTED]')).toBe('[REDACTED]');
    });

    it('changes a string', () => {
      expect(sanitizeValue(input, value => `${value.substring(0, 4)}X`)).toBe('HellX');
    });
  });

  describe('when sanitize a number', () => {
    const input: number = 14;

    it('returns the number when no sanitizer provided', () => {
      expect(sanitizeValue(input)).toBe(input);
    });

    it('redacts a number', () => {
      expect(sanitizeValue(input, () => 0)).toBe(0);
    });

    it('changes a number', () => {
      expect(sanitizeValue(input, value => value * 2)).toBe(28);
    });
  });

  describe('when sanitizing an array', () => {
    const input: string[] = ['Alice', 'Bob'];

    it('returns the input when no sanitizier provided', () => {
      expect(sanitizeValue(input)).toBe(input);
    });

    it('sanitizes each value', () => {
      expect(sanitizeValue(input, value => value.toUpperCase())).toStrictEqual(['ALICE', 'BOB']);
    });
  });

  describe('when sanitizing an object', () => {
    it('returns the input when no sanitizer provided', () => {
      const input = {
        age: 22,
        name: 'Alice',
      };

      expect(sanitizeValue(input)).toBe(input);
    });

    it('redacts the complete object', () => {
      const input = {
        age: 22,
        name: 'Alice',
      };

      expect(sanitizeValue(input, value => ({ age: 0, name: value.name.toUpperCase() }))).toStrictEqual({ age: 0, name: 'ALICE' });
    });

    it('redacts single attributes', () => {
      const input = {
        age: 22,
        name: 'Alice',
      };

      expect(sanitizeValue(input, { age: age => age * 2 })).toStrictEqual({ age: 44, name: 'Alice' });
    });

    it('works with nested fields', () => {
      const input: Foo = {
        friends: [
          {
            name: 'Bob',
            status: 'friend',
          },
          {
            name: 'Dave',
            status: 'family',
          },
        ],
        user: {
          age: 22,
          name: 'Alice',
        },
      };

      const result = sanitizeValue(input, {
        friends: {
          name: name => (name.substring(0, 1)),
          status: () => 'unknown' as const,
        },
        user: {
          age: age => (age * 2),
        },
      });

      expect(result).toStrictEqual({
        friends: [
          {
            name: 'B',
            status: 'unknown',
          },
          {
            name: 'D',
            status: 'unknown',
          },
        ],
        user: {
          age: 44,
          name: 'Alice',
        },
      });
    });

    it('works with the README example', () => {
      const originalLog = {
        action: 'add ToDo',
        name: 'Alice',
      };

      const auditLog = sanitizeValue(originalLog, {
        name: (name) => {
          if (name.length > 3) {
            const firstChar = name.charAt(0);
            const lastChar = name.charAt(name.length - 1);
            const redacted = '·'.repeat(name.length - 2);
            return `${firstChar}${redacted}${lastChar}`;
          }
          else {
            return '·'.repeat(name.length);
          }
        },
      });

      expect(auditLog).toStrictEqual({
        action: 'add ToDo',
        name: 'A···e',
      });
    });
  });
});
