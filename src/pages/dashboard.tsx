import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import Head from 'next/head';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { prisma } from '@/lib/prisma';
import styles from '@/styles/Dashboard.module.css';

type SavedSermon = {
  id: string;
  title: string;
  scripture: string;
  createdAt: string;
};

interface DashboardProps {
  savedSermons: SavedSermon[];
}

export default function Dashboard({ savedSermons: initialSermons }: DashboardProps) {
  const router = useRouter();
  const { status } = useAuth();
  const [sermons, setSermons] = useState<SavedSermon[]>(initialSermons);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleViewSermon = (id: string) => {
    router.push(`/sermons/${id}`);
  };

  const handleDeleteSermon = async (id: string) => {
    if (confirm('Are you sure you want to delete this sermon?')) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/sermons/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setSermons(sermons.filter(sermon => sermon.id !== id));
        } else {
          alert('Failed to delete sermon');
        }
      } catch (error) {
        console.error('Error deleting sermon:', error);
        alert('Error deleting sermon');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>My Sermons | Sermon Generator</title>
      </Head>

      <Header />

      <main className={styles.main}>
        <h1 className={styles.title}>My Sermons</h1>
        
        {sermons.length === 0 ? (
          <div className={styles.emptyState}>
            <p>You haven't created any sermons yet.</p>
            <button 
              onClick={() => router.push('/')}
              className={styles.createButton}
            >
              Create Your First Sermon
            </button>
          </div>
        ) : (
          <div className={styles.sermonList}>
            {sermons.map((sermon) => (
              <div key={sermon.id} className={styles.sermonCard}>
                <div className={styles.sermonInfo}>
                  <h3 className={styles.sermonTitle}>{sermon.title}</h3>
                  <p className={styles.sermonScripture}>
                    {sermon.scripture || "No scripture reference"}
                  </p>
                  <p className={styles.sermonDate}>
                    Created: {new Date(sermon.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={styles.sermonActions}>
                  <button
                    onClick={() => handleViewSermon(sermon.id)}
                    className={styles.viewButton}
                    disabled={isLoading}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteSermon(sermon.id)}
                    className={styles.deleteButton}
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerSession(context.req, context.res, authOptions);
    
    // If the user is not logged in, redirect to sign in
    if (!session) {
      return {
        redirect: {
          destination: '/auth/signin',
          permanent: false,
        },
      };
    }
  
    // Fetch the user's saved sermons from the database
    const savedSermons = await prisma.sermon.findMany({
      where: {
        user: {
          email: session.user?.email as string,
        },
      },
      select: {
        id: true,
        title: true,
        scripture: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  
    return {
      props: {
        savedSermons: savedSermons.map(sermon => ({
          ...sermon,
          createdAt: sermon.createdAt.toISOString(),
        })),
      },
    };
  }