import OpenAI from 'openai';

export async function generateMetadata(
  word: string,
  apiKey: string
): Promise<string[]> {
  if (!apiKey) {
    console.error('No API key provided');
    return [];
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are word associating master mind.',
        },
        {
          role: 'user',
          content: `List 20 words that best represent this word/phrase: ${word}. emphasizing traits or concepts that link it to categories or related ideas. Ensure at least one keyword connects it to its general classification, seperate with comas and keep everything lowercase.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    const content = response.choices[0]?.message?.content || '';
    return content.split(',').map((word) => word.trim());
  } catch (error) {
    console.error('Error generating metadata:', error);
    return [];
  }
}
