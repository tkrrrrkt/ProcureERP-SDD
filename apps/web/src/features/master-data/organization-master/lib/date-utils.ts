/**
 * Organization Master Feature - Date Utilities
 */

/**
 * ISO 8601日付文字列をYYYY/MM/DD形式に変換
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * ISO 8601日時文字列をYYYY/MM/DD HH:mm形式に変換
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const datePart = formatDate(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${datePart} ${hours}:${minutes}`;
}

/**
 * DateオブジェクトをISO 8601日付文字列（YYYY-MM-DD）に変換
 */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 日付文字列が有効かどうかを検証
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
