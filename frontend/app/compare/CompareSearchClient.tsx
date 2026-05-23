'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface QuickSchool {
  slug: string;
  name_zh: string;
}

interface CompareSearchClientProps {
  currentSlugs: string[];
  allSchools: QuickSchool[];
}

export default function CompareSearchClient({ currentSlugs, allSchools }: CompareSearchClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter schools that are not fully selected yet
  const availableSchools = allSchools.filter(s => !currentSlugs.includes(s.slug));
  const filtered = availableSchools.filter(s => s.name_zh.toLowerCase().includes(search.toLowerCase()) || s.slug.toLowerCase().includes(search.toLowerCase()));

  // Hide dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSchool = (slug: string) => {
    if (currentSlugs.length >= 4) {
      alert('最多只能同时比较 4 所学校。');
      return;
    }
    const newSlugs = [...currentSlugs, slug];
    router.push(`/compare?s=${newSlugs.join(',')}`);
    setSearch('');
    setShowDropdown(false);
  };

  const removeSchool = (slug: string) => {
    const newSlugs = currentSlugs.filter(s => s !== slug);
    if (newSlugs.length > 0) {
      router.push(`/compare?s=${newSlugs.join(',')}`);
    } else {
      router.push('/compare');
    }
  };

  return (
    <div className={styles.searchWrapper} ref={containerRef}>
      <div className={styles.searchBar}>
        <input 
          type="text" 
          value={search} 
          onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          placeholder="➕ 输入学校名称添加对比..."
          className={styles.searchInput}
          disabled={currentSlugs.length >= 4}
        />
        {showDropdown && filtered.length > 0 && (
          <ul className={styles.dropdown}>
            {filtered.map(s => (
              <li key={s.slug} onClick={() => addSchool(s.slug)} className={styles.dropdownItem}>
                {s.name_zh}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {currentSlugs.length > 0 && (
         <div className={styles.selectedTags}>
           {currentSlugs.map(slug => {
             const sc = allSchools.find(x => x.slug === slug);
             return (
               <span key={slug} className={styles.tag}>
                 {sc ? sc.name_zh : slug}
                 <button onClick={() => removeSchool(slug)} className={styles.tagRemove}>✕</button>
               </span>
             );
           })}
         </div>
      )}
    </div>
  );
}
