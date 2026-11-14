import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Returns the number in E.164 (e.g. +972501234567), or null if it isn't a valid number.
 * shortcut: numbers without a +country code are assumed to be Israeli, change when you support other countries.
 */
export function normalizePhone(phone: string): string | null {
  const parsed = parsePhoneNumberFromString(phone, 'IL');
  return parsed?.isValid() ? parsed.number : null;
}
