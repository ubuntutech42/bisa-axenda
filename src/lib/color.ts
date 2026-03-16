/**
 * Converte HSL (0-360, 0-100, 0-100) para hex #rrggbb.
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Valores HSL dos --chart-1 a --chart-5 (theme) em hex para <input type="color">. */
const CHART_HEX: Record<string, string> = {
  'hsl(var(--chart-1))': hslToHex(28, 80, 52),
  'hsl(var(--chart-2))': hslToHex(47, 88, 44),
  'hsl(var(--chart-3))': hslToHex(20, 80, 55),
  'hsl(var(--chart-4))': hslToHex(10, 80, 50),
  'hsl(var(--chart-5))': hslToHex(350, 80, 58),
};

const HEX_REGEX = /^#[0-9a-f]{6}$/i;

/**
 * Retorna uma cor em formato #rrggbb para uso em <input type="color">.
 * Aceita: #hex, hsl(var(--chart-N)), ou hsl(h, s%, l%).
 */
export function colorToHexForInput(color: string | undefined): string {
  if (!color || typeof color !== 'string') return '#808080';
  const trimmed = color.trim();
  if (HEX_REGEX.test(trimmed)) return trimmed;
  const chartHex = CHART_HEX[trimmed];
  if (chartHex) return chartHex;
  const hslMatch = trimmed.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i);
  if (hslMatch) {
    return hslToHex(Number(hslMatch[1]), Number(hslMatch[2]), Number(hslMatch[3]));
  }
  return '#808080';
}
