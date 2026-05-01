import { cn } from '@/lib/utils';

describe('Utility Functions - Unit Tests', () => {
  describe('cn (Tailwind Merge)', () => {
    it('should correctly merge tailwind classes and override conflicts', () => {
      // Arrange
      const class1 = 'px-2 py-2';
      const class2 = 'px-4';

      // Act
      const result = cn(class1, class2);

      // Assert
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
      expect(result).not.toContain('px-2');
    });

    it('should handle conditional classes properly', () => {
      // Arrange
      const baseClass = 'base';
      const isActive = true;
      const isDisabled = false;

      // Act
      const result = cn(baseClass, isActive && 'is-active', isDisabled && 'is-disabled');

      // Assert
      expect(result).toContain('base');
      expect(result).toContain('is-active');
      expect(result).not.toContain('is-disabled');
    });

    it('should handle undefined and null inputs without crashing', () => {
      // Arrange
      const inputs = ['base', undefined, null, false, 'extra'];

      // Act
      const result = cn(...inputs);

      // Assert
      expect(result).toBe('base extra');
    });
  });
});
