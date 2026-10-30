/**
 * Converts share links (e.g. Google Drive "view" links) into direct image URLs
 * that can be used in an <img src>. Other URLs are returned unchanged.
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const driveMatch =
    trimmed.match(/drive\.google\.com\/file\/d\/([^/?#]+)/) ||
    trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([^&#]+)/);
  if (driveMatch) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}=w1600`;
  }

  return trimmed;
}
