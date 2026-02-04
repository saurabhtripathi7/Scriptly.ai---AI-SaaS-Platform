export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const isRateLimit = err?.status === 429;

    if (!isRateLimit || retries <= 0) {
      throw err;
    }

    console.warn(`Rate limited. Retrying in ${delayMs}ms...`);

    await new Promise(res => setTimeout(res, delayMs));

    return retryWithBackoff(fn, retries - 1, delayMs * 2);
  }
}
