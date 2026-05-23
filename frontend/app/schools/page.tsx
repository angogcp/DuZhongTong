import styles from './page.module.css';
import SchoolFilters from './SchoolFilters';

async function getSchools() {
  try {
    const res = await fetch('http://127.0.0.1:1337/api/schools?populate=*&pagination[pageSize]=100', {
      cache: 'no-store'
    });
    if (!res.ok) return { data: [] };
    return res.json();
  } catch {
    return { data: [] };
  }
}

async function getSchoolFees() {
  try {
    const res = await fetch('http://127.0.0.1:1337/api/school-fees?populate=school&pagination[pageSize]=100', {
      cache: 'no-store'
    });
    if (!res.ok) return { data: [] };
    return res.json();
  } catch {
    return { data: [] };
  }
}

export default async function SchoolsPage() {
  const [schoolsRes, feesRes] = await Promise.all([getSchools(), getSchoolFees()]);
  const schools = schoolsRes.data || [];
  const fees = feesRes.data || [];

  // Build fee lookup by school documentId
  const feeLookup: Record<string, number> = {};
  for (const f of fees) {
    const schoolId = f.school?.documentId;
    if (schoolId && f.tuition_fee) {
      feeLookup[schoolId] = f.tuition_fee;
    }
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>找学校</h1>
          <p className={styles.subtitle}>发掘适合的独立中学，按州属、宿舍与学费轻松筛选与比较</p>
        </div>
      </header>

      <main className="container">
        <SchoolFilters schools={schools} feeLookup={feeLookup} />
      </main>
    </div>
  );
}
