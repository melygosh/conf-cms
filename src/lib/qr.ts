import QRCode from 'qrcode';

/** A QR code as an inline `<svg>` string, drawn at build time (no image service). */
export function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: 'svg', margin: 0, errorCorrectionLevel: 'M' });
}
