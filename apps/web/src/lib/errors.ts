import { isAxiosError } from 'axios';

/** Turns an API/axios error into a message a user can read. Nest sends `message` as a string or string[]. */
export function getErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (message) return message;
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}
