import axios from 'axios';

const GROQ_API_KEY = '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';

async function test() {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: 'say hi' }]
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('SUCCESS:', response.data.choices[0].message.content);
  } catch (err) {
    console.log('FAILED:', err.response?.data || err.message);
  }
}

test();