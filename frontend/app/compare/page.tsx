import styles from './page.module.css';
import Link from 'next/link';
import CompareSearchClient from './CompareSearchClient';
import BlockRenderer from '../schools/[slug]/BlockRenderer';

async function getAllSchoolsBasic() {
  try {
    const res = await fetch('http://127.0.0.1:1337/api/schools?fields[0]=name_zh&fields[1]=slug&pagination[pageSize]=100', { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function getCompareData(slugs: string[]) {
  if (slugs.length === 0) return [];
  
  // We'll fetch full data for each slug in parallel
  const fetchSchoolData = async (slug: string) => {
    try {
      const [schoolRes, feeRes, hostelRes, admissionRes] = await Promise.all([
        fetch(`http://127.0.0.1:1337/api/schools?filters[slug][$eq]=${slug}&populate=*`, { cache: 'no-store' }),
        fetch(`http://127.0.0.1:1337/api/school-fees?filters[school][slug][$eq]=${slug}`, { cache: 'no-store' }),
        fetch(`http://127.0.0.1:1337/api/hostels?filters[school][slug][$eq]=${slug}`, { cache: 'no-store' }),
        fetch(`http://127.0.0.1:1337/api/admissions?filters[school][slug][$eq]=${slug}&populate=*`, { cache: 'no-store' })
      ]);
      const schoolJson = await (schoolRes.ok ? schoolRes.json() : Promise.resolve({ data: [] }));
      const feeJson = await (feeRes.ok ? feeRes.json() : Promise.resolve({ data: [] }));
      const hostelJson = await (hostelRes.ok ? hostelRes.json() : Promise.resolve({ data: [] }));
      const admissionJson = await (admissionRes.ok ? admissionRes.json() : Promise.resolve({ data: [] }));

      const base = schoolJson.data[0];
      if (!base) return null;
      return {
        ...base,
        school_fees: feeJson.data?.[0] || null,
        hostel: hostelJson.data?.[0] || null,
        admissions: admissionJson.data?.[0] || null,
      };
    } catch {
      return null;
    }
  };

  const results = await Promise.all(slugs.map(fetchSchoolData));
  return results.filter(Boolean); // removes nulls
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const resolvedParams = await searchParams;
  const slugs = resolvedParams.s ? resolvedParams.s.split(',').filter(x => x.trim() !== '').slice(0, 4) : [];
  
  const allSchools = await getAllSchoolsBasic();
  const compareSchools = await getCompareData(slugs);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>各校比较器</h1>
          <p className={styles.subtitle}>最多可同时选择 4 所独中，全方位横向对比学费、宿舍与报考门槛</p>
          
          <CompareSearchClient 
            currentSlugs={compareSchools.map(s => s.slug)} 
            allSchools={allSchools} 
          />
        </div>
      </header>

      <main className="container">
        {compareSchools.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛠️</div>
            <h2>请在上方搜索并添加需要对比的学校</h2>
            <p>通过横向对比，更容易找到匹配您家庭预算和距离要求的学校。</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th className={styles.featureCol}>比较维度</th>
                  {compareSchools.map((s, i) => (
                    <th key={s.documentId} className={styles.schoolCol}>
                       <Link href={`/schools/${s.slug}`} className={styles.schoolHeaderLink}>
                         <h3>{s.name_zh}</h3>
                         <span className={styles.enName}>{s.name_en}</span>
                       </Link>
                    </th>
                  ))}
                  {/* Fill empty columns if less than 2 schools are compared just for visual balance optionally, mostly it's fine */}
                </tr>
              </thead>
              <tbody>
                {/* ---------- 基础设置 ---------- */}
                <tr className={styles.groupHeader}><td colSpan={compareSchools.length + 1}>📍 基础信息</td></tr>
                <tr>
                  <td className={styles.featureCol}>地点</td>
                  {compareSchools.map(s => <td key={s.documentId}>{s.state} · {s.city}</td>)}
                </tr>
                <tr>
                  <td className={styles.featureCol}>学校类型</td>
                  {compareSchools.map(s => <td key={s.documentId}>{s.school_type === 'Coed' ? '男女混校' : s.school_type === 'Boys' ? '男校' : '女校'}</td>)}
                </tr>
                <tr>
                  <td className={styles.featureCol}>创校年份</td>
                  {compareSchools.map(s => <td key={s.documentId}>{s.established_year || '—'}</td>)}
                </tr>

                {/* ---------- 学费费用 ---------- */}
                <tr className={styles.groupHeader}><td colSpan={compareSchools.length + 1}>💰 学杂费与宿舍预估</td></tr>
                <tr>
                  <td className={styles.featureCol}>全年学杂费预估<br/><span className={styles.hint}>(不含宿舍)</span></td>
                  {compareSchools.map(s => (
                    <td key={s.documentId} className={styles.highlightText}>
                      {s.school_fees?.total_yearly ? `RM ${s.school_fees.total_yearly.toLocaleString()}` : '暂无数据'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className={styles.featureCol}>首次注册费</td>
                  {compareSchools.map(s => <td key={s.documentId}>{s.school_fees?.registration_fee ? `RM ${s.school_fees.registration_fee.toLocaleString()}` : '—'}</td>)}
                </tr>
                <tr>
                  <td className={styles.featureCol}>住宿提供</td>
                  {compareSchools.map(s => (
                    <td key={s.documentId}>
                      {s.has_hostel ? (
                        <span className={styles.successBadge}>✓ 有宿舍提供</span>
                      ) : (
                        <span className={styles.neutralBadge}>✕ 无宿舍</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className={styles.featureCol}>宿舍月费</td>
                  {compareSchools.map(s => <td key={s.documentId}>{s.hostel?.monthly_fee ? `RM ${s.hostel.monthly_fee.toLocaleString()}` : '—'}</td>)}
                </tr>

                {/* ---------- 招考 ---------- */}
                <tr className={styles.groupHeader}><td colSpan={compareSchools.length + 1}>📅 招生与入学要求</td></tr>
                <tr>
                  <td className={styles.featureCol}>报名期限</td>
                  {compareSchools.map(s => (
                    <td key={s.documentId}>
                      {s.admissions?.application_start ? `${s.admissions.application_start} 至 ${s.admissions.application_end || '满额即止'}` : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className={styles.featureCol}>入学考试</td>
                  {compareSchools.map(s => <td key={s.documentId}>{s.admissions?.exam_date || '—'}</td>)}
                </tr>
                <tr>
                  <td className={styles.featureCol}>保送/录取条件</td>
                  {compareSchools.map(s => (
                    <td key={s.documentId} className={styles.rtCell}>
                      {s.admissions?.eligibility ? <BlockRenderer blocks={s.admissions.eligibility} /> : '暂无条件记录'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
