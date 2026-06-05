export function randomId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}
