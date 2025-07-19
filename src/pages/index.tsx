import { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import SermonForm from '@/components/SermonForm';
import SermonResult from '@/components/SermonResult';
import { Sermon, InputType } from '@/types';

import styles from '@/styles/Home.module.css';

export default function Home() {
  
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateSermon = async (input: string, inputType: InputType) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/generate-sermon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input, inputType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate sermon');
      }

      const data = await response.json();
      setSermon(data.sermon);
      
      // Scroll to results
      setTimeout(() => {
        const sermonResult = document.querySelector('#sermon-result');
        if (sermonResult) {
          sermonResult.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error generating sermon:', error);
      setError(error instanceof Error ? error.message : 'Error generating sermon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Sermon Generator | Bible-Based Content Creation</title>
        <meta name="description" content="Generate sermon content from Bible passages or topics with our easy-to-use tool" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Open+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Header />

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Sermon Generator</h1>
          <p className={styles.description}>
            Create Bible-based sermon content in seconds
          </p>
        </div>

        <div className={styles.features}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>📖</div>
            <h3>Bible-Focused</h3>
            <p>Generate content from specific Bible passages or topics</p>
          </div>
          
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>⚡️</div>
            <h3>Quick & Easy</h3>
            <p>Create sermon outlines and notes with just a few clicks</p>
          </div>
          
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🧠</div>
            <h3>AI-Powered</h3>
            <p>Leverages advanced AI to create biblically sound content</p>
          </div>
        </div>

        <div className={styles.card}>
          <SermonForm onSubmit={generateSermon} loading={loading} />
          
          {error && (
            <div className={styles.errorContainer}>
              <p className={styles.errorMessage}>{error}</p>
            </div>
          )}
        </div>
        
        {sermon && (
          <div id="sermon-result" className={styles.card}>
            <SermonResult sermon={sermon} />
          </div>
        )}

        <div className={styles.aboutSection}>
          <h2 className={styles.aboutTitle}>About This Tool</h2>
          <div className={styles.aboutContent}>
            <p>
              The Sermon Generator helps pastors, Bible study leaders, and teachers create Scripture-based content efficiently. While this tool provides a strong foundation, we encourage you to personalize the content with your own insights, stories, and applications to best serve your congregation or audience.
            </p>
            <p>
              This AI-powered tool is designed to save time in sermon preparation by providing structure and content suggestions based on biblical passages and themes. Its not meant to replace personal study and prayer but to enhance your sermon preparation process.
            </p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Sermon Generator App | Created with Next.js</p>
        <p>A Tool To Help with Bible-based Content Creation</p>
      </footer>
    </div>
  );
}