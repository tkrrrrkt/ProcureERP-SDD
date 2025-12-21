/**
 * Date utility functions for employee master management
 */

/**
 * Format ISO 8601 date string to YYYY-MM-DD
 * @param isoDateString - ISO 8601 date string (e.g., "2020-04-01T00:00:00.000Z")
 * @returns Formatted date string (e.g., "2020-04-01")
 */
export function formatDate(isoDateString: string): string {
  const date = new Date(isoDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert YYYY-MM-DD to ISO 8601 date string
 * @param dateString - Date string (e.g., "2020-04-01")
 * @returns ISO 8601 date string (e.g., "2020-04-01T00:00:00.000Z")
 */
export function toISODateString(dateString: string): string {
  return new Date(dateString).toISOString();
}

/**
 * Check if date string is valid
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
