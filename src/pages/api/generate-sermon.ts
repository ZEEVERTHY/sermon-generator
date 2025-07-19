import type { NextApiRequest, NextApiResponse } from 'next';
import { Sermon, GenerateSermonRequest } from '@/types';
import { generateSermonWithAI } from '@/lib/openai';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

type ErrorResponse = {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ sermon: Sermon } | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { input, inputType } = req.body as GenerateSermonRequest;

    if (!input || input.trim() === '') {
      return res.status(400).json({ message: 'Input is required' });
    }
    
    // Get AI-generated content
    const aiContent = await generateSermonWithAI(input, inputType);
    
    // Parse the AI response into our sermon structure
    const sermon = parseAIResponseToSermon(aiContent, input, inputType);
    
    // Save sermon to database if user is logged in
    const session = await getServerSession(req, res, authOptions);
    if (session?.user?.email) {
      await prisma.sermon.create({
        data: {
          title: sermon.title,
          scripture: sermon.scripture,
          content: JSON.stringify(sermon),
          user: {
            connect: {
              email: session.user.email
            }
          }
        }
      });
    }
    
    res.status(200).json({ sermon });
  } catch (error) {
    console.error('Error generating sermon:', error);
    res.status(500).json({ message: 'Error generating sermon' });
  }
}

function parseAIResponseToSermon(aiContent: string, input: string, inputType: 'passage' | 'topic'): Sermon {
  // Basic parsing logic - this can be improved based on the actual structure of the AI responses
  const lines = aiContent.split('\n').filter(line => line.trim() !== '');
  
  // Extract title (first line or generate a default)
  const title = lines[0] || `Sermon on ${input}`;
  
  // Extract scripture references (look for Bible verses)
  const scriptureRegex = /([1-3]?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?)/g;
  const scriptureMatches = aiContent.match(scriptureRegex);
  const scripture = scriptureMatches ? scriptureMatches.join(', ') : (inputType === 'passage' ? input : '');
  
  // Find sections (Introduction, Points, Conclusion, Call to Action)
  const introIndex = findSectionIndex(lines, 'Introduction');
  const conclusionIndex = findSectionIndex(lines, 'Conclusion');
  const callToActionIndex = findSectionIndex(lines, 'Call to Action');
  
  // Extract introduction
  const introduction = introIndex >= 0 ? 
    lines.slice(introIndex + 1, findNextSectionIndex(lines, introIndex + 1)).join('\n') : 
    'Let us explore what God\'s Word has to say about this important subject.';
  
  // Extract conclusion
  const conclusion = conclusionIndex >= 0 ? 
    lines.slice(conclusionIndex + 1, callToActionIndex >= 0 ? callToActionIndex : lines.length).join('\n') : 
    'As we conclude our study, let us remember to apply these truths to our daily lives.';
  
  // Extract call to action
  const callToAction = callToActionIndex >= 0 ? 
    lines.slice(callToActionIndex + 1).join('\n') : 
    'This week, I encourage you to reflect on what we\'ve learned and consider how God is calling you to respond.';
  
  // Extract main points
  const mainPoints = extractMainPoints(lines, introIndex, conclusionIndex);
  
  return {
    title,
    scripture,
    introduction,
    mainPoints,
    conclusion,
    callToAction
  };
}

function findSectionIndex(lines: string[], sectionName: string): number {
  return lines.findIndex(line => 
    line.toLowerCase().includes(sectionName.toLowerCase()) && 
    line.length < 50
  );
}

function findNextSectionIndex(lines: string[], startIndex: number): number {
  for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].length < 50 && lines[i].endsWith(':')) {
      return i;
    }
  }
  return lines.length;
}

function extractMainPoints(lines: string[], introIndex: number, conclusionIndex: number): Array<{heading: string, content: string, supportingScripture: string}> {
  const mainPoints = [];
  const startIndex = introIndex >= 0 ? introIndex + 1 : 0;
  const endIndex = conclusionIndex >= 0 ? conclusionIndex : lines.length;
  
  // Simple approach: Look for numbered points or headers
  let currentPoint = null;
  let pointContent = [];
  
  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i];
    
    // Check if this is a new point heading
    if (
      (line.match(/^\d+\.\s+/) || line.match(/^[IVX]+\.\s+/) || line.length < 50 && line.trim().endsWith(':')) && 
      !line.toLowerCase().includes('introduction') && 
      !line.toLowerCase().includes('conclusion')
    ) {
      // Save previous point if exists
      if (currentPoint) {
        // Look for scripture references in the point content
        const contentText = pointContent.join('\n');
        const scriptureRegex = /([1-3]?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?)/g;
        const scriptureMatches = contentText.match(scriptureRegex);
        const supportingScripture = scriptureMatches ? scriptureMatches[0] : '';
        
        mainPoints.push({
          heading: currentPoint,
          content: contentText,
          supportingScripture
        });
        pointContent = [];
      }
      
      currentPoint = line.replace(/^\d+\.\s+/, '').replace(/^[IVX]+\.\s+/, '').replace(/:$/, '');
    } else if (currentPoint) {
      pointContent.push(line);
    }
  }
  
  // Add the last point if exists
  if (currentPoint && pointContent.length > 0) {
    const contentText = pointContent.join('\n');
    const scriptureRegex = /([1-3]?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?)/g;
    const scriptureMatches = contentText.match(scriptureRegex);
    const supportingScripture = scriptureMatches ? scriptureMatches[0] : '';
    
    mainPoints.push({
      heading: currentPoint,
      content: contentText,
      supportingScripture
    });
  }
  
  // If no points were found, create three generic points
  if (mainPoints.length === 0) {
    return [
      { heading: "Biblical Context", content: "Understanding the historical and cultural background of the text.", supportingScripture: "" },
      { heading: "Theological Significance", content: "Exploring the theological implications of this passage or topic.", supportingScripture: "" },
      { heading: "Practical Application", content: "How we can apply these truths to our daily lives.", supportingScripture: "" }
    ];
  }
  
  return mainPoints;
}