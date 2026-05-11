/**
 * Common utility functions for the API
 */
export const utils = {
  /**
   * Simple sleep function for dev testing
   */
  sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Validate Indian mobile number format
   */
  isValidPhone: (phone: string) => /^[6-9]\d{9}$/.test(phone),
};
