import Link from "next/link";
import styles from "./landing.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.box}>
        <h1 className={styles.title}>Crypto Market Snapshot</h1>
        <p className={styles.subtitle}>
          Slide-ready market overview powered by CoinGecko.
        </p>
        <div className={styles.links}>
          <Link href="/month" className={styles.link}>
            <span className={styles.linkLabel}>Month</span>
            <span className={styles.linkSub}>30-day window</span>
          </Link>
          <Link href="/year" className={styles.link}>
            <span className={styles.linkLabel}>Year</span>
            <span className={styles.linkSub}>1-year window</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
