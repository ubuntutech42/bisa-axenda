import { describe, expect, it } from 'vitest';
import { colorToHexForInput } from './color';

describe('colorToHexForInput', () => {
  it('retorna fallback quando entrada e invalida', () => {
    expect(colorToHexForInput(undefined)).toBe('#808080');
    expect(colorToHexForInput('')).toBe('#808080');
    expect(colorToHexForInput('invalid-color')).toBe('#808080');
  });

  it('mantem cores hex validas', () => {
    expect(colorToHexForInput('#123abc')).toBe('#123abc');
    expect(colorToHexForInput('#ABCDEF')).toBe('#ABCDEF');
  });

  it('converte tokens chart para hex esperado', () => {
    expect(colorToHexForInput('hsl(var(--chart-1))')).toBe('#e77e23');
    expect(colorToHexForInput('hsl(var(--chart-5))')).toBe('#ea3e5b');
  });

  it('converte hsl explicito para hex', () => {
    expect(colorToHexForInput('hsl(0, 100%, 50%)')).toBe('#ff0000');
    expect(colorToHexForInput('hsl(120, 100%, 50%)')).toBe('#00ff00');
    expect(colorToHexForInput('hsl(240, 100%, 50%)')).toBe('#0000ff');
  });
});
