import styles from "./page.module.css";
import Link from 'next/link';

async function getSchools() {
  try {
    const res = await fetch('http://127.0.0.1:1337/api/schools?populate=*&pagination[pageSize]=100', { cache: 'no-store' });
    if (!res.ok) return { data: [] };
    return res.json();
  } catch { return { data: [] }; }
}

async function getArticles() {
  try {
    const res = await fetch('http://127.0.0.1:1337/api/articles?sort=createdAt:desc&pagination[pageSize]=3', { cache: 'no-store' });
    if (!res.ok) return { data: [] };
    return res.json();
  } catch { return { data: [] }; }
}

async function getSchoolFees() {
  try {
    const res = await fetch('http://127.0.0.1:1337/api/school-fees?populate=school&pagination[pageSize]=100', { cache: 'no-store' });
    if (!res.ok) return { data: [] };
    return res.json();
  } catch { return { data: [] }; }
}

export default async function Home() {
  const [schoolsRes, articlesRes, feesRes] = await Promise.all([
    getSchools(), getArticles(), getSchoolFees()
  ]);
  const schools = schoolsRes.data || [];
  const articles = articlesRes.data || [];
  const fees = feesRes.data || [];

  // Build fee lookup by school documentId
  const feeLookup: Record<string, number> = {};
  for (const f of fees) {
    const schoolId = f.school?.documentId;
    if (schoolId && f.tuition_fee) {
      feeLookup[schoolId] = f.tuition_fee;
    }
  }

  const uniqueStates = new Set(schools.map((s: any) => s.state).filter(Boolean));
  const hostelCount = schools.filter((s: any) => s.has_hostel).length;
  const featured = schools.slice(0, 4);

  const categoryMap: Record<string, string> = {
    'News': '📰 新闻', 'Guide': '📘 指南', 'Topic': '🎯 专题', 'Wiki': '📖 百科'
  };

  return (
    <div className={styles.homeContainer}>
      {/* ===== Hero ===== */}
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>✨ 2026 最新全国独中报考情报上线</div>
          <h1 className={styles.heroTitle}>
            找到最适合孩子的<span className={styles.heroHighlight}>独立中学</span>
          </h1>
          <p className={styles.heroSubtitle}>
            独中通包含全马独中数据库。从学费、宿舍、统考成绩到升学全景图，择校更轻松。
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/matcher" className={styles.searchCtaBtn}>
              ✨ 开始智能选校
            </Link>
            <Link href="/schools" className={`${styles.searchCtaBtn} ${styles.altCtaBtn}`}>
              🔍 浏览全部学校
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Stats Bar ===== */}
      <section className={styles.statsBar}>
        <div className={`container ${styles.statsInner}`}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{schools.length}</span>
            <span className={styles.statLabel}>所独中</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{uniqueStates.size}</span>
            <span className={styles.statLabel}>个州属</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{hostelCount}</span>
            <span className={styles.statLabel}>所提供宿舍</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>100%</span>
            <span className={styles.statLabel}>免费公开</span>
          </div>
        </div>
      </section>

      {/* ===== Quick Nav ===== */}
      <section className={`container ${styles.quickNavSection}`}>
        <h2 className={styles.sectionTitle}>你需要了解什么？</h2>
        <div className={styles.quickNavGrid}>
           <Link href="/schools" className={styles.navCard}>
              <div className={styles.navIcon}>🏫</div>
              <h3>找学校</h3>
              <p>完整收录马国独中，按州地、费用、宿舍筛选。</p>
           </Link>
           <Link href="/compare" className={styles.navCard}>
              <div className={styles.navIcon}>⚖️</div>
              <h3>比学校</h3>
              <p>横向比对学费、初高中结构、成绩单，优劣立判。</p>
           </Link>
           <Link href="/admissions" className={styles.navCard}>
              <div className={styles.navIcon}>📅</div>
              <h3>看报考</h3>
              <p>时刻关注各校最新招生时间、入学考试及开放日。</p>
           </Link>
           <Link href="/uec" className={styles.navCard}>
              <div className={styles.navIcon}>📚</div>
              <h3>查统考</h3>
              <p>什么是 UEC？统考科目解析与毕业生去向大数据。</p>
           </Link>
        </div>
      </section>

      {/* ===== Featured Schools ===== */}
      {featured.length > 0 && (
        <section className={styles.featuredSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>精选学校</h2>
              <Link href="/schools" className={styles.viewAllLink}>查看全部 →</Link>
            </div>
            <div className={styles.featuredGrid}>
              {featured.map((school: any) => (
                <Link href={`/schools/${school.slug}`} key={school.documentId} className={styles.featuredCard}>
                  <div className={styles.featuredCardGradient}>
                    <div className={styles.featuredBadges}>
                      <span className={styles.stateBadge}>{school.state}</span>
                      {school.has_hostel && <span className={styles.hostelBadge}>🏠 宿舍</span>}
                    </div>
                  </div>
                  <div className={styles.featuredCardBody}>
                    <h3>{school.name_zh}</h3>
                    <p className={styles.featuredEnName}>{school.name_en}</p>
                    <div className={styles.featuredMeta}>
                      <span>📍 {school.city || school.state}</span>
                      <span>🏛️ {school.established_year}</span>
                      {feeLookup[school.documentId] && (
                        <span className={styles.feeBadge}>💰 RM {feeLookup[school.documentId].toLocaleString()}/年</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Articles / Guides ===== */}
      {articles.length > 0 && (
        <section className={`container ${styles.articlesSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>最新情报与指南</h2>
            <Link href="/articles" className={styles.viewAllLink}>阅读更多 →</Link>
          </div>
          <div className={styles.articlesGrid}>
            {articles.map((article: any) => (
              <Link href={`/articles/${article.slug}`} key={article.documentId} className={styles.articleCard}>
                <div className={styles.articleCategoryBadge}>
                  {categoryMap[article.category] || article.category}
                </div>
                <h3 className={styles.articleTitle}>{article.title}</h3>
                <p className={styles.articleExcerpt}>{article.excerpt || '点击查看详情...'}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2>还在犹豫选哪所独中？</h2>
            <p>使用我们的 AI 智能筛选工具，根据州属、宿舍、学费等条件快速找到最适合您孩子的学校。</p>
            <Link href="/matcher" className={styles.ctaButton}>
              开始智能选校 →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
