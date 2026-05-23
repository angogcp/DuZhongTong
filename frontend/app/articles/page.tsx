import Link from 'next/link';
import styles from './page.module.css';

async function getArticles(categoryFilter?: string) {
  try {
    let url = 'http://127.0.0.1:1337/api/articles?populate=*&sort=publishedAt:desc';
    if (categoryFilter && categoryFilter !== 'All') {
      url += `&filters[category][$eq]=${categoryFilter}`;
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function ArticlesIndexPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const resolvedParams = await searchParams;
  const currentCategory = resolvedParams.c || 'All';
  const articles = await getArticles(currentCategory);

  const categories = ['All', 'News', 'Guide', 'Topic', 'Wiki'];
  const categoryLabels: Record<string, string> = {
    'All': '全部内容',
    'News': '最新动态',
    'Guide': '报考指南',
    'Topic': '升学专题',
    'Wiki': '独中百科'
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>独中情报与选校故事</h1>
          <p className={styles.subtitle}>发掘最新的家长心得、招生资讯以及深度的独中教育与升学分析，帮您做出最好的决定。</p>
        </div>
      </header>

      <main className="container">
        {/* Category Filters */}
        <div className={styles.filterMenu}>
           {categories.map(cat => (
             <Link 
               key={cat}
               href={`/articles${cat === 'All' ? '' : `?c=${cat}`}`}
               className={`${styles.filterBtn} ${currentCategory === cat ? styles.active : ''}`}
             >
               {categoryLabels[cat]}
             </Link>
           ))}
        </div>

        {/* Article Grid */}
        {articles.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>分类下暂无文章</h2>
            <p>小编正在拼命赶稿中，敬请期待！</p>
          </div>
        ) : (
          <div className={styles.articleGrid}>
             {articles.map((a: any) => (
                <Link key={a.documentId} href={`/articles/${a.slug}`} className={styles.articleCard}>
                  <div className={styles.cardCover}>
                    {/* Placeholder cover since we don't upload real rich media in MVP */}
                    <div className={styles.coverPlaceholder}>
                       {a.category === 'News' ? '🗞️' : a.category === 'Guide' ? '🧭' : '💡'}
                    </div>
                    <span className={styles.categoryBadge}>{categoryLabels[a.category] || a.category}</span>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.articleTitle}>{a.title}</h3>
                    <p className={styles.articleExcerpt}>{a.excerpt || '点击阅读全文了解更多详情...'}</p>
                    <div className={styles.articleMeta}>
                      <span>{new Date(a.publishedAt).toLocaleDateString('zh-CN')}</span>
                      <span className={styles.readMore}>阅读全文 →</span>
                    </div>
                  </div>
                </Link>
             ))}
          </div>
        )}
      </main>
    </div>
  );
}
