import axios from 'axios';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

interface MistralResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function summarizeWithMistral(
  content: string, 
  platform: string, 
  contentLength: string,
  summaryType: string, 
  tone: string
): Promise<string> {
  const lengthGuide = {
    short: { min: 150, max: 300 },
    mid: { min: 300, max: 450 },
    long: { min: 400, max: 550 }
  };

  const { min, max } = lengthGuide[contentLength as keyof typeof lengthGuide];

  const prompt = `Summarize the following content for ${platform}. 
Target length: between ${min} and ${max} words.
Summary type: ${summaryType}
Tone: ${tone}
Style: Professional and engaging
Maintain key points and call-to-action if present.
Include relevant hashtags at the end.
Original content: ${content}`;

  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await axios.post<MistralResponse>(
        MISTRAL_API_URL,
        {
          model: "mistral-tiny",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const summary = response.data.choices[0].message.content.trim();
      
      // Ensure the summary is within the specified range
      const wordCount = summary.split(/\s+/).length;
      if (wordCount < min) {
        return summary + ' ' + ' '.repeat(min - wordCount);
      } else if (wordCount > max) {
        return summary.split(/\s+/).slice(0, max).join(' ');
      }
      
      return summary;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        retries++;
        const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
        console.log(`Rate limited. Retrying in ${waitTime / 1000} seconds...`);
        await delay(waitTime);
      } else {
        console.error('Error calling Mistral AI:', error);
        throw new Error('Failed to generate summary');
      }
    }
  }

  throw new Error('Max retries reached. Failed to generate summary.');
}

