import styles from './page.module.css';
import Link from 'next/link';
import BlockRenderer from '../../schools/[slug]/BlockRenderer';

async function getArticleBySlug(slug: string) {
  try {
    const res = await fetch(`http://127.0.0.1:1337/api/articles?filters[slug][$eq]=${slug}&populate=*`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data[0] || null;
  } catch {
    return null;
  }
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = await getArticleBySlug(resolvedParams.slug);

  if (!article) {
    return (
      <div className={styles.notFound}>
        <h1>找不到该文章</h1>
        <p>可能已经被删除或重新命名。</p>
        <Link href="/articles" className={styles.backBtn}>← 返回文章列表</Link>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    'News': '最新动态',
    'Guide': '报考指南',
    'Topic': '升学专题',
    'Wiki': '独中百科'
  };

  return (
    <article className={styles.articleOuter}>
      <header className={styles.articleHeader}>
        <div className="container">
          <Link href="/articles" className={styles.backLink}>← 返回文章汇编</Link>
          <div className={styles.metaTop}>
             <span className={styles.categoryBadge}>{categoryLabels[article.category] || article.category}</span>
             <span className={styles.publishDate}>{new Date(article.publishedAt).toLocaleDateString('zh-CN')}</span>
          </div>
          <h1 className={styles.title}>{article.title}</h1>
          {article.excerpt && (
            <p className={styles.excerpt}>{article.excerpt}</p>
          )}
        </div>
      </header>

      <main className="container">
        <div className={styles.contentWrapper}>
          {article.content ? (
            <div className={styles.richText}>
              <BlockRenderer blocks={article.content} />
            </div>
          ) : (
            <p className={styles.emptyText}>本文暂无详细内容。</p>
          )}
        </div>
      </main>
    </article>
  );
}
