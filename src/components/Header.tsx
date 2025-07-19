import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/Header.module.css';

export default function Header() {
  const {status} = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Sermon Generator
        </Link>

        <nav className={styles.nav}>
          {status === 'authenticated' && (
            <Link href="/dashboard" className={styles.navLink}>
              My Sermons
            </Link>
          )}

          
        </nav>
      </div>
    </header>
  );
}