export async function withBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let retries = 0;
    while (true) {
      try {
        return await fn();
      } catch (error) {
        if (error instanceof Error && error.message.includes('Too Many Requests') && retries < maxRetries) {
          const delay = initialDelay * Math.pow(2, retries);
          console.log(`Rate limited. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        } else {
          throw error;
        }
      }
    }
  }
  
  