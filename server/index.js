import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/metadata', async (req, res) => {
  const { word } = req.body;
  if (!word) {
    return res.status(400).json({ error: 'Word is required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are word associating master mind.' },
        {
          role: 'user',
          content:
            `List 20 words that best represent this word/phrase: ${word}. emphasizing traits or concepts that link it to categories or related ideas. Ensure at least one keyword connects it to its general classification, seperate with comas and keep everything lowercase.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    const content = response.choices[0]?.message?.content || '';
    const metadata = content.split(',').map((w) => w.trim());
    res.json({ metadata });
  } catch (err) {
    console.error('Error generating metadata:', err);
    res.status(500).json({ error: 'Failed to generate metadata' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
