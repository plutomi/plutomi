/**
 *
 * @param ms Delay in milliseconds
 * @returns a promise that resolves after the given delay
 */
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
