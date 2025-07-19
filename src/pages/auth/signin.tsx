import { useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import { getProviders, signIn, getCsrfToken } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Auth.module.css';

interface SignInProps {
  providers: Record<string, { id: string; name: string; type: string }>;
  csrfToken: string;
}

export default function SignIn({ providers, csrfToken }: SignInProps) {
  const [email, setEmail] = useState('');

  return (
    <div className={styles.container}>
      <Head>
        <title>Sign In | Sermon Generator</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.description}>
          Sign in to access your saved sermons and sermon history
        </p>

        <div className={styles.authContainer}>
          {/* Email Sign In */}
          {providers.email && (
            <div className={styles.emailSignIn}>
              <form
                method="post"
                action="/api/auth/signin/email"
                className={styles.emailForm}
              >
                <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                <label>
                  Email address
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    placeholder="name@example.com"
                  />
                </label>
                <button type="submit" className={styles.button}>
                  Sign in with Email
                </button>
              </form>
            </div>
          )}

          {/* OAuth Providers */}
          <div className={styles.oauthProviders}>
            {Object.values(providers)
              .filter((provider) => provider.type === 'oauth')
              .map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => signIn(provider.id)}
                  className={`${styles.button} ${styles[provider.id]}`}
                >
                  Sign in with {provider.name}
                </button>
              ))}
          </div>

          <div className={styles.backLink}>
            <Link href="/">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // If the user is already logged in, redirect.
  if (session) {
    return { redirect: { destination: '/' } };
  }

  const providers = await getProviders();
  const csrfToken = await getCsrfToken(context);
  
  return {
    props: { providers: providers ?? {}, csrfToken: csrfToken ?? '' },
  };
}