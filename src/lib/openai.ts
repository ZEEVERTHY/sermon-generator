import { OpenAI } from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to generate sermon content using OpenAI
export async function generateSermonWithAI(
  input: string, 
  inputType: 'passage' | 'topic'
): Promise<string> {
  try {
    const prompt = inputType === 'passage' 
      ? `Create a sermon based on the Bible passage: ${input}. Include an introduction, 3 main points with supporting scriptures, a conclusion, and a call to action.`
      : `Create a sermon on the topic: ${input}. Include relevant Bible verses, an introduction, 3 main points with supporting scriptures, a conclusion, and a call to action.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable pastor creating biblically sound, insightful sermons. Format your response with clear sections."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0]?.message.content || "Failed to generate sermon content.";
  } catch (error) {
    console.error('Error generating sermon with AI:', error);
    throw new Error('Failed to generate sermon with OpenAI');
  }
}