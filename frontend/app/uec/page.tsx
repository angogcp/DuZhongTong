import styles from './page.module.css';
import BlockRenderer from '../schools/[slug]/BlockRenderer';

async function getUecInfos() {
  try {
    const res = await fetch('http://127.0.0.1:1337/api/uec-infos?sort=order:asc', {
      cache: 'no-store'
    });
    if (!res.ok) return { data: [] };
    return res.json();
  } catch {
    return { data: [] };
  }
}

export default async function UecPage() {
  const { data: uecInfos } = await getUecInfos();

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>统考情报中心 (UEC)</h1>
          <p className={styles.subtitle}>全面了解马来西亚华文独立中学的统一考试机制、文凭受承认去向及升学优势。</p>
        </div>
      </header>

      <div className={`container ${styles.uecLayout}`}>
        <aside className={styles.sidebar}>
          <h3>目录索引</h3>
          <ul className={styles.tocList}>
            {uecInfos && uecInfos.length > 0 ? (
              uecInfos.map((info: any) => (
                <li key={info.documentId}>
                  <a href={`#${info.slug}`} className={styles.tocLink}>
                    {info.title}
                  </a>
                </li>
              ))
            ) : (
              // Fallback TOC
              <>
                <li><a href="#intro" className={styles.tocLink}>什么是统考 (UEC)？</a></li>
                <li><a href="#levels" className={styles.tocLink}>初中与高中统考</a></li>
                <li><a href="#recognition" className={styles.tocLink}>国际与国内承认度</a></li>
                <li><a href="#comparison" className={styles.tocLink}>UEC vs SPM vs IGCSE</a></li>
              </>
            )}
          </ul>
        </aside>

        <main className={styles.contentArea}>
          {uecInfos && uecInfos.length > 0 ? (
            uecInfos.map((info: any) => (
              <article key={info.documentId} id={info.slug} className={styles.contentCard}>
                <h2 className={styles.sectionTitle}>{info.title}</h2>
                <div className={styles.richText}>
                  <BlockRenderer blocks={info.content} />
                </div>
              </article>
            ))
          ) : (
            // Static Fallback Content
            <>
              <article id="intro" className={styles.contentCard}>
                <h2 className={styles.sectionTitle}>什么是统考 (UEC)？</h2>
                <div className={styles.richText}>
                  <p><b>马来西亚华文独立中学统一考试（Unified Examination Certificate，简称统考或 UEC）</b> 是由马来西亚华校董事联合会总会（董总）为主办单位的一项标准化考试。它创立于 1975 年，专门为马来西亚全国 60 所（及数所分校）独立中学的学生而设。</p>
                  <blockquote>它的主要语言媒介是华文，部分理科及数学科目也考查英文或双语。统考文凭是独中生申请国内外大学的主要学历凭证。</blockquote>
                  <p>一直以来，统考凭借其严谨的学术标准，在国际上享有极高的学术声誉。</p>
                </div>
              </article>

              <article id="levels" className={styles.contentCard}>
                <h2 className={styles.sectionTitle}>初中与高中统考</h2>
                <div className={styles.richText}>
                  <p>统考分为两个主要阶段：</p>
                  <h3>初中统考 (JUEC)</h3>
                  <p>学生在独中完成三年初中教育（初三）后，必须参加初中统考。一般包含 5 到 7 个基础科目（如华、国、英、数、科学、历史、地理）。成绩将作为升读高中理科、文科或商科的重要参考依据。</p>
                  <h3>高中统考 (SUEC)</h3>
                  <p>独中高三学生在毕业前参加的高级考试，难度对应或略高于普通的高中毕业考试（相当于 A-Level 或 STPM 水平）。大学通常以 <b>高中统考成绩最佳 5 科 或 6 科</b> 来评估学生的录取资格。常见选科如下：</p>
                  <ul>
                    <li><b>理科生：</b> 高级数学(I/II)、物理、化学、生物等。</li>
                    <li><b>文商科生：</b> 商业学、簿记与会计、经济学、历史、地理等。</li>
                  </ul>
                </div>
              </article>

              <article id="recognition" className={styles.contentCard}>
                <h2 className={styles.sectionTitle}>国际与国内承认度</h2>
                <div className={styles.richText}>
                  <p>尽管 UEC 目前尚未完全纳入马来西亚国立大学的常规本科录取系统（部分豁免或特殊通道除外），但它在<b>私立高等教育机构及国际大学</b>中广受认可。</p>
                  <h3>全球认可网络</h3>
                  <ul>
                    <li><b>新加坡：</b> 国立大学 (NUS)、南洋理工大学 (NTU) 等顶尖大学直接接受高统成绩申请本科。</li>
                    <li><b>台湾与中国大陆：</b> 清华、北大、台大等数百所两岸高校将其视为重要入学资质，提供专属奖学金。</li>
                    <li><b>英澳美加：</b> 大部分在《泰晤士报高等教育排名》前 200 的英联邦及北美高校（如墨尔本大学、爱丁堡大学）承认 UEC，学生可直接进入本科大一，无需念预科 (Foundation)。</li>
                    <li><b>马来西亚私立大学：</b> 双威、泰莱、优大 (UTAR)、拉曼学院 (TAR UMT) 等百分百承认且以此作为奖学金发放标准。</li>
                  </ul>
                </div>
              </article>

              <article id="comparison" className={styles.contentCard}>
                <h2 className={styles.sectionTitle}>UEC vs SPM vs IGCSE</h2>
                <div className={styles.richText}>
                  <div className={styles.tableContainer}>
                    <table className={styles.comparisonTable}>
                      <thead>
                        <tr>
                          <th>特性</th>
                          <th>UEC (高中统考)</th>
                          <th>SPM (国中毕业考)</th>
                          <th>IGCSE (国际学校)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><b>学制/年级</b></td>
                          <td>高三 (Year 12相当)</td>
                          <td>中五 (Year 11相当)</td>
                          <td>Year 11相当</td>
                        </tr>
                        <tr>
                          <td><b>学术深度</b></td>
                          <td>较深，部分理科近乎大学预科级别</td>
                          <td>基础中等</td>
                          <td>基础中等</td>
                        </tr>
                        <tr>
                          <td><b>升学路径</b></td>
                          <td>直接申请大多数海外大学本科大一</td>
                          <td>需先修读 Pre-U (STPM/A-level/Foundation)</td>
                          <td>需先修读 A-level 或 Foundation</td>
                        </tr>
                        <tr>
                          <td><b>国内公立大学</b></td>
                          <td>受限（政府不承认）</td>
                          <td>主要通道 (需STPM/Matrikulasi)</td>
                          <td>不直接适用</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </article>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
