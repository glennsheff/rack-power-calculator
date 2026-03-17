export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Pre-computed SHA-256 hash of "AiFi-Rack-2024"
export const PASSWORD_HASH = '840a97a8a248513b8987979c7f2f96d3374265198f94bd38091ddf2ddb17d531';
