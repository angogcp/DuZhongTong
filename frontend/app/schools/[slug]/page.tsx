import styles from './page.module.css';
import Link from 'next/link';
import BlockRenderer from './BlockRenderer';
import FeeCalculator from './FeeCalculator';

const campusPhotos: Record<string, string> = {
  'chong-hwa-kl': '/chong_hwa_campus.png',
  'confucian-kl': '/confucian_campus.png',
  'kuen-cheng': '/kuen_cheng_campus.png',
  'tsun-jin': '/tsun_jin_campus.png',
  'hin-hua': '/hin_hua_campus.png',
  'pin-hwa': '/pin_hwa_campus.png',
  'kwang-hua': '/kwang_hua_campus.png',
  'chung-hua-klang': '/chung_hua_klang_campus.png',
};


async function getSchoolBySlug(slug: string) {
  try {
    const res = await fetch(`http://127.0.0.1:1337/api/schools?filters[slug][$eq]=${slug}&populate=*`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data[0] || null;
  } catch {
    return null;
  }
}

async function getSchoolRelations(slug: string) {
  try {
    const urls = [
      `http://127.0.0.1:1337/api/school-fees?filters[school][slug][$eq]=${slug}`,
      `http://127.0.0.1:1337/api/hostels?filters[school][slug][$eq]=${slug}`,
      `http://127.0.0.1:1337/api/admissions?filters[school][slug][$eq]=${slug}&populate=*`,
      `http://127.0.0.1:1337/api/exam-results?filters[school][slug][$eq]=${slug}&sort=year:desc`,
      `http://127.0.0.1:1337/api/graduate-destinations?filters[school][slug][$eq]=${slug}&sort=year:desc`
    ];
    const responses = await Promise.all(urls.map(url => fetch(url, { cache: 'no-store' })));
    const jsons = await Promise.all(responses.map(res => res.ok ? res.json() : { data: [] }));
    return {
      school_fees: jsons[0]?.data?.[0] || null,
      hostel: jsons[1]?.data?.[0] || null,
      admissions: jsons[2]?.data?.[0] || null,
      exam_results: jsons[3]?.data || [],
      graduate_destinations: jsons[4]?.data || []
    };
  } catch {
    return { school_fees: null, hostel: null, admissions: null, exam_results: [], graduate_destinations: [] };
  }
}

export default async function SchoolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const schoolBase = await getSchoolBySlug(resolvedParams.slug);
  const relations = schoolBase ? await getSchoolRelations(resolvedParams.slug) : null;
  const school = schoolBase && relations ? { ...schoolBase, ...relations } : schoolBase;

  if (!school) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundIcon}>🏫</div>
        <h1>找不到该学校</h1>
        <p>抱歉，未找到此网址匹配的独立中学，请确认链接是否正确。</p>
        <Link href="/schools" className={styles.backBtn}>← 返回学校列表</Link>
      </div>
    );
  }

  const typeLabel = school.school_type === 'Coed' ? '男女混校' : school.school_type === 'Boys' ? '男校' : '女校';

  return (
    <div className={styles.pageContainer}>
      {/* Hero */}
      <header className={styles.heroSection}>
        <div className="container">
          <Link href="/schools" className={styles.backLink}>← 返回列表</Link>
          <div className={styles.heroContent}>
            <div className={styles.badges}>
               <span className={styles.badge}>{school.state} · {school.city}</span>
               {school.has_hostel && <span className={`${styles.badge} ${styles.badgeHostel}`}>🏠 有宿舍</span>}
               <span className={styles.badge}>{typeLabel}</span>
            </div>
            <h1 className={styles.title}>{school.name_zh}</h1>
            <h2 className={styles.enName}>{school.name_en}</h2>

            {/* Quick Stats */}
            <div className={styles.quickStats}>
              <div className={styles.quickStatItem}>
                <span className={styles.quickStatLabel}>建校年份</span>
                <span className={styles.quickStatValue}>{school.established_year}</span>
              </div>
              {school.school_fees && (
                <div className={styles.quickStatItem}>
                  <span className={styles.quickStatLabel}>学费/年</span>
                  <span className={styles.quickStatValue}>RM {school.school_fees.tuition_fee?.toLocaleString() || '—'}</span>
                </div>
              )}
              {school.hostel && (
                <div className={styles.quickStatItem}>
                  <span className={styles.quickStatLabel}>宿舍月费</span>
                  <span className={styles.quickStatValue}>RM {school.hostel.monthly_fee?.toLocaleString() || '—'}</span>
                </div>
              )}
              {school.motto && (
                <div className={styles.quickStatItem}>
                  <span className={styles.quickStatLabel}>校训</span>
                  <span className={styles.quickStatValue}>{school.motto}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Campus Banner Image if available */}
      {campusPhotos[school.slug] && (
        <div className="container" style={{ marginTop: '2rem' }}>
          <div style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}>
            <img 
              src={campusPhotos[school.slug]} 
              alt={`${school.name_zh} 校园风光`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', padding: '2rem 1.5rem', color: 'white' }}>
              <span style={{ backgroundColor: '#0D9488', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                📸 校园实景 · 智能视觉呈现
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`container ${styles.mainContent}`}>
        <article className={styles.contentSection}>
          {/* Summary */}
          <section className={styles.contentBlock}>
            <h3 className={styles.sectionTitle}>学校简介</h3>
            <div className={styles.richText}>
              <BlockRenderer blocks={school.summary} fallback="该校的详细介绍文本正在完善中，请稍后在 Strapi 后台填充。" />
            </div>
            {school.language_env && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(13, 148, 136, 0.05)', borderRadius: '8px', borderLeft: '4px solid #0D9488', fontSize: '0.95rem', color: '#334155', lineHeight: '1.5' }}>
                <strong>🗣️ 教学语言环境：</strong>{school.language_env}
              </div>
            )}
          </section>


          {/* Fees */}
          {school.school_fees && (
            <section id="fees" className={styles.dataWidget}>
               <h3 className={styles.sectionTitle}>💰 全年学杂费预估计算器</h3>
               <FeeCalculator fees={school.school_fees} hostel={school.hostel} />
            </section>
          )}

          {/* Hostel */}
          {school.hostel && (
            <section id="hostel" className={styles.dataWidget}>
               <h3 className={styles.sectionTitle}>🛏️ 宿舍与作息</h3>
               <ul className={styles.featureList}>
                 <li><strong>对象：</strong>{school.hostel.male_hostel && '男生宿'}{school.hostel.male_hostel && school.hostel.female_hostel && ' 及 '}{school.hostel.female_hostel && '女生宿'}</li>
                 <li><strong>房型：</strong>{school.hostel.room_type || '基本多人间'}</li>
                 <li><strong>月费：</strong>RM {school.hostel.monthly_fee?.toLocaleString() || '请咨询校方'}</li>
                 {school.hostel.study_hours && <li><strong>晚自习：</strong>{school.hostel.study_hours}</li>}
               </ul>
               {school.hostel.meal_plan && (
                 <div className={styles.subSection}>
                   <h4>膳食安排</h4>
                   <div className={styles.richText}><BlockRenderer blocks={school.hostel.meal_plan} /></div>
                 </div>
               )}
            </section>
          )}

          {/* Admissions */}
          {school.admissions && (
            <section id="admission" className={styles.dataWidget}>
               <h3 className={styles.sectionTitle}>📅 报考指南</h3>
               <ul className={styles.featureList}>
                 <li><strong>招生学年：</strong>{school.admissions.intake_year || '最新年度'} 学期</li>
                 <li><strong>申请期限：</strong>{school.admissions.application_start} 至 {school.admissions.application_end || '额满即止'}</li>
                 <li><strong>入学考日期：</strong>{school.admissions.exam_date || '待定'}</li>
                 {school.admissions.scholarship_available && (
                   <li className={styles.scholarshipBadge}>🎓 <strong>本校提供奖助学金</strong></li>
                 )}
               </ul>
               {school.admissions.eligibility && (
                 <div className={styles.subSection}>
                   <h4>录取条件</h4>
                   <div className={styles.richText}><BlockRenderer blocks={school.admissions.eligibility} /></div>
                 </div>
               )}
               {school.admissions.required_documents && (
                 <div className={styles.subSection}>
                   <h4>所需材料</h4>
                   <div className={styles.richText}><BlockRenderer blocks={school.admissions.required_documents} /></div>
                 </div>
               )}
            </section>
          )}

          {/* Exam Results */}
          {school.exam_results && school.exam_results.length > 0 && (
            <section id="uec" className={styles.dataWidget}>
               <h3 className={styles.sectionTitle}>📊 统考成绩</h3>
               <div className={styles.examGrid}>
                 {school.exam_results.map((er: any) => (
                   <div key={er.documentId} className={styles.examCard}>
                     <div className={styles.examYear}>{er.year}</div>
                     <div className={styles.examType}>{er.exam_type === 'Junior' ? '初中统考' : '高中统考'}</div>
                     {er.pass_rate && <div className={styles.examRate}>及格率 {er.pass_rate}%</div>}
                   </div>
                 ))}
               </div>
            </section>
          )}

          {/* Graduate Destinations */}
          {school.graduate_destinations && school.graduate_destinations.length > 0 && (
            <section id="graduates" className={styles.dataWidget}>
               <h3 className={styles.sectionTitle}>🎓 毕业生去向</h3>
               {school.graduate_destinations.map((gd: any) => (
                 <div key={gd.documentId} className={styles.gradYearBlock}>
                   <h4 className={styles.gradYearTitle}>{gd.year}年 升学地区分布</h4>
                   <div className={styles.barChart}>
                     {gd.destinations?.map((d: any, i: number) => (
                       <div key={i} className={styles.barItem}>
                         <div className={styles.barLabel}>{d.region}</div>
                         <div className={styles.barTrack}>
                           <div className={styles.barFill} style={{ width: `${d.percentage}%` }}></div>
                         </div>
                         <div className={styles.barValue}>{d.percentage}%</div>
                       </div>
                     ))}
                   </div>

                   {gd.major_distribution && gd.major_distribution.length > 0 && (
                     <div className={styles.majorBlock}>
                       <h4 className={styles.gradYearTitle}>热门科系分布</h4>
                       <div className={styles.majorTags}>
                         {gd.major_distribution.map((m: any, i: number) => (
                           <span key={i} className={styles.majorTag}>
                             {m.major} ({m.percentage}%)
                           </span>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               ))}
            </section>
          )}

          {/* Education Features */}
          {school.education_features && (
            <section className={styles.contentBlock}>
              <h3 className={styles.sectionTitle}>教育特色</h3>
              <div className={styles.richText}><BlockRenderer blocks={school.education_features} /></div>
            </section>
          )}

          {/* Facilities */}
          {school.facilities && (
            <section className={styles.contentBlock}>
              <h3 className={styles.sectionTitle}>校园设施</h3>
              <div className={styles.richText}><BlockRenderer blocks={school.facilities} /></div>
            </section>
          )}

          {/* Clubs */}
          {school.clubs && (
            <section className={styles.contentBlock}>
              <h3 className={styles.sectionTitle}>社团活动</h3>
              <div className={styles.richText}><BlockRenderer blocks={school.clubs} /></div>
            </section>
          )}
        </article>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={`${styles.card} glass-effect`}>
             <h4>快速入口</h4>
             <ul className={styles.quickLinks}>
               <li><Link href={`/compare?s=${school.slug}`} className={styles.compareLink}>⚖️ 加入比较器</Link></li>
               {school.school_fees && <li><a href="#fees">💰 学杂费预估</a></li>}
               {school.hostel && <li><a href="#hostel">🛏️ 宿舍资讯</a></li>}
               {school.admissions && <li><a href="#admission">📅 入学报考</a></li>}
               {school.exam_results?.length > 0 && <li><a href="#uec">📊 统考成绩</a></li>}
             </ul>
          </div>

          <div className={styles.card}>
             <h4>联系方式</h4>
             <div className={styles.contactInfo}>
               {school.address && <p><strong>地址</strong><br/>{school.address}</p>}
               {school.phone && <p><strong>电话</strong><br/><a href={`tel:${school.phone}`}>{school.phone}</a></p>}
               {school.email && <p><strong>邮箱</strong><br/><a href={`mailto:${school.email}`}>{school.email}</a></p>}
               {school.website && (
                 <a href={school.website} target="_blank" rel="noopener noreferrer" className={styles.websiteBtn}>
                   🌐 访问官网
                 </a>
               )}
               {school.facebook && (
                 <a href={school.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                   📘 Facebook 专页
                 </a>
               )}
             </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
