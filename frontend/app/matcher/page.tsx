import styles from './page.module.css';
import MatcherWizard from './MatcherWizard';

// Helper to bundle all schools with their fees and hostel data for the matcher engine
async function getMatcherData() {
  try {
    const res = await fetch('http://127.0.0.1:1337/api/schools?pagination[pageSize]=100', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    const schools = json.data || [];

    // Fetch relations
    const [feesRes, hostelsRes] = await Promise.all([
      fetch('http://127.0.0.1:1337/api/school-fees?pagination[pageSize]=100&populate=*', { cache: 'no-store' }),
      fetch('http://127.0.0.1:1337/api/hostels?pagination[pageSize]=100&populate=*', { cache: 'no-store' })
    ]);
    
    const feesData = feesRes.ok ? await feesRes.json() : { data: [] };
    const hostelsData = hostelsRes.ok ? await hostelsRes.json() : { data: [] };

    // Combine
    return schools.map((s: any) => {
      const fee = feesData.data.find((f: any) => f.school?.slug === s.slug);
      const hostel = hostelsData.data.find((h: any) => h.school?.slug === s.slug);
      return {
        ...s,
        school_fees: fee || null,
        hostel: hostel || null
      };
    });
  } catch (err) {
    return [];
  }
}

export default async function MatcherPage() {
  const schoolsData = await getMatcherData();

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>AI 选校智能匹配</h1>
          <p className={styles.subtitle}>回答三个简单问题，为您精准推荐最适合您家庭规划与预算的独立中学。</p>
        </div>
      </header>

      <main className="container">
        <section className={styles.wizardSection}>
          <MatcherWizard schools={schoolsData} />
        </section>
      </main>
    </div>
  );
}
