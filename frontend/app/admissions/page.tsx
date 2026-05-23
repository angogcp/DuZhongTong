import styles from './page.module.css';
import Link from 'next/link';
import BlockRenderer from '../schools/[slug]/BlockRenderer';

async function getAdmissions() {
  try {
    // Fetch admissions populated with school data
    const res = await fetch('http://127.0.0.1:1337/api/admissions?populate=school&pagination[pageSize]=100', {
      cache: 'no-store'
    });
    if (!res.ok) return { data: [] };
    return res.json();
  } catch {
    return { data: [] };
  }
}

export default async function AdmissionsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const resolvedParams = await searchParams;
  const viewMode = resolvedParams.view === 'calendar' ? 'calendar' : 'state';
  const { data: admissions } = await getAdmissions();

  // Group by state
  const groupedAdmissions: Record<string, any[]> = {};
  
  // Calendar feed: sort by application_end ascending (nulls last)
  const calendarFeed = [...admissions].sort((a, b) => {
    if (!a.application_end) return 1;
    if (!b.application_end) return -1;
    return new Date(a.application_end).getTime() - new Date(b.application_end).getTime();
  });

  if (viewMode === 'state') {
    admissions.forEach((a: any) => {
      if (!a.school) return;
      const state = a.school.state || 'Other';
      if (!groupedAdmissions[state]) groupedAdmissions[state] = [];
      groupedAdmissions[state].push(a);
    });
  }

  const states = Object.keys(groupedAdmissions).sort();

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className={styles.title}>报考资讯</h1>
              <p className={styles.subtitle}>发掘各大独中的报名期限、入学考时间及录取门槛条件，不错过任何重要日程。</p>
            </div>
            <div className={styles.viewToggleGroup}>
              <Link href="/admissions?view=state" className={`${styles.viewToggleBtn} ${viewMode === 'state' ? styles.active : ''}`}>
                🏢 地区概览
              </Link>
              <Link href="/admissions?view=calendar" className={`${styles.viewToggleBtn} ${viewMode === 'calendar' ? styles.active : ''}`}>
                ⏳ 招生日历
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        {viewMode === 'state' ? (
          states.length > 0 ? (
            states.map(state => (
              <div key={state} className={styles.stateGroup}>
                <h2 className={styles.stateLabel}>
                  {state} <span className={styles.stateCount}>{groupedAdmissions[state].length} 所更新</span>
                </h2>
              
              <div className={styles.admissionGrid}>
                {groupedAdmissions[state].map(a => (
                  <div key={a.documentId} className={styles.admissionCard}>
                    <div className={styles.cardTopBar} />
                    <div className={styles.cardContent}>
                      <h3 className={styles.schoolName}>{a.school.name_zh}</h3>
                      <p className={styles.schoolEnName}>{a.school.name_en}</p>
                      
                      <div className={styles.cardBadges}>
                        <span className={styles.hostelBadge}>🗓️ {a.intake_year || new Date().getFullYear() + 1} 学年</span>
                        {a.scholarship_available && (
                          <span className={styles.scholarshipBadge}>🏅 奖助学金</span>
                        )}
                      </div>

                      <div className={styles.dateTimeline}>
                        <div className={styles.dateItem}>
                          <div className={styles.dateIcon}>📝</div>
                          <div className={styles.dateContent}>
                            <span className={styles.dateLabel}>报名期间</span>
                            <span className={styles.dateValue}>
                              {a.application_start || '未定'} 
                              {a.application_end ? ` 至 ${a.application_end}` : ''}
                            </span>
                          </div>
                        </div>
                        <div className={styles.dateItem}>
                          <div className={styles.dateIcon}>✍️</div>
                          <div className={styles.dateContent}>
                            <span className={styles.dateLabel}>入学考试</span>
                            <span className={styles.dateValue}>{a.exam_date || '未定 / 视通告'}</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.eligibilityBlock}>
                        <div className={styles.eligibilityLabel}>录取 / 保送条件概要</div>
                        <div className={styles.eligibilityText}>
                           {a.eligibility ? (
                             <BlockRenderer blocks={a.eligibility} />
                           ) : (
                             '暂无具体的录取条件细节。'
                           )}
                        </div>
                      </div>
                      
                      <Link href={`/schools/${a.school.slug}#admission`} className={styles.viewSchoolLink}>
                        查看学校详情 →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📅</div>
            <h2>暂缺最新招生信息</h2>
            <p>目前系统尚未录入或开放各校的招生时间表，请稍后再来查看此页面。</p>
          </div>
        )
        ) : (
          /* Calendar View */
          calendarFeed.length > 0 ? (
            <div className={styles.calendarTimeline}>
              <div className={styles.timelineLine}></div>
              {calendarFeed.map((a, i) => (
                <div key={a.documentId} className={styles.timelineItem}>
                   <div className={styles.timelineDot}></div>
                   <div className={styles.timelineContent}>
                     <div className={styles.timelineDateHeader}>
                        {a.application_end ? (
                          <>截止日期：<strong>{new Date(a.application_end).toLocaleDateString('zh-CN')}</strong></>
                        ) : (
                          <><strong>满额即止</strong></>
                        )}
                        <span className={styles.timelineBadge}>{a.intake_year} 学期</span>
                     </div>
                     <Link href={`/schools/${a.school.slug}`} className={styles.timelineSchoolTitle}>
                        {a.school.name_zh} <span className={styles.enName}>{a.school.name_en}</span>
                     </Link>
                     <div className={styles.timelineDetails}>
                        <p><strong>📍 地点：</strong> {a.school.state} · {a.school.city}</p>
                        <p><strong>✍️ 报考期：</strong> {a.application_start} 至 {a.application_end || '满额即止'}</p>
                        <p><strong>🎯 入学考：</strong> {a.exam_date}</p>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📅</div>
              <h2>暂无日历数据</h2>
            </div>
          )
        )}
      </main>
    </div>
  );
}
