import { useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { Sermon } from '@/types';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import SermonResult from '@/components/SermonResult';
import styles from '@/styles/SermonDetail.module.css';

interface SermonDetailProps {
  sermon: Sermon & { id: string };
}

export default function SermonDetail({ sermon }: SermonDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this sermon?')) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/sermons/${sermon.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          router.push('/dashboard');
        } else {
          alert('Failed to delete sermon');
        }
      } catch (error) {
        console.error('Error deleting sermon:', error);
        alert('Error deleting sermon');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>{sermon.title} | Sermon Generator</title>
      </Head>

      <Header />

      <main className={styles.main}>
        <div className={styles.actions}>
          <Link href="/dashboard" className={styles.backLink}>
            ← Back to Dashboard
          </Link>
          <button 
            onClick={handleDelete} 
            className={styles.deleteButton}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Sermon'}
          </button>
        </div>

        <div className={styles.sermonContainer}>
          <SermonResult sermon={sermon} />
        </div>
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

  const sermonId = context.params?.id as string;

  // Fetch the sermon from the database
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

  // If the sermon doesn't exist or doesn't belong to the user, return 404
  if (!sermon || sermon.user.email !== session.user?.email) {
    return {
      notFound: true,
    };
  }

  // Parse the content JSON
  const sermonContent = JSON.parse(sermon.content) as Sermon;

  return {
    props: {
      sermon: {
        id: sermon.id,
        ...sermonContent,
      },
    },
  };
}