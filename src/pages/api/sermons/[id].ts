import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  
  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const sermonId = req.query.id as string;

  // GET request to fetch a sermon
  if (req.method === 'GET') {
    try {
      const sermon = await prisma.sermon.findUnique({
        where: {
          id: sermonId,
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      // Check if sermon exists and belongs to the current user
      if (!sermon || sermon.user.email !== session.user?.email) {
        return res.status(404).json({ message: 'Sermon not found' });
      }

      return res.status(200).json({
        id: sermon.id,
        ...JSON.parse(sermon.content),
      });
    } catch (error) {
      console.error('Error fetching sermon:', error);
      return res.status(500).json({ message: 'Error fetching sermon' });
    }
  }
  
  // DELETE request to delete a sermon
  else if (req.method === 'DELETE') {
    try {
      // First check if the sermon exists and belongs to the user
      const sermon = await prisma.sermon.findUnique({
        where: {
          id: sermonId,
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!sermon) {
        return res.status(404).json({ message: 'Sermon not found' });
      }

      if (sermon.user.email !== session.user?.email) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Delete the sermon
      await prisma.sermon.delete({
        where: {
          id: sermonId,
        },
      });

      return res.status(200).json({ message: 'Sermon deleted successfully' });
    } catch (error) {
      console.error('Error deleting sermon:', error);
      return res.status(500).json({ message: 'Error deleting sermon' });
    }
  }
  
  // Method not allowed
  else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}