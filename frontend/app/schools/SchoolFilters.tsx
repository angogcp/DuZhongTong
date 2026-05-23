'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
  'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah',
  'Sarawak', 'Selangor', 'Terengganu', 'Kuala Lumpur'
];

interface SchoolFiltersProps {
  schools: any[];
  feeLookup: Record<string, number>;
}

export default function SchoolFilters({ schools, feeLookup }: SchoolFiltersProps) {
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [hostelOnly, setHostelOnly] = useState(false);

  const filtered = useMemo(() => {
    return schools.filter((s: any) => {
      const q = search.toLowerCase();
      const matchName = !q ||
        (s.name_zh || '').toLowerCase().includes(q) ||
        (s.name_en || '').toLowerCase().includes(q);
      const matchState = !state || s.state === state;
      const matchHostel = !hostelOnly || s.has_hostel;
      return matchName && matchState && matchHostel;
    });
  }, [schools, search, state, hostelOnly]);

  // Get states actually present in data
  const availableStates = useMemo(() => {
    const s = new Set(schools.map((sc: any) => sc.state).filter(Boolean));
    return STATES.filter(st => s.has(st));
  }, [schools]);

  const activeFilters = [search, state, hostelOnly].filter(Boolean).length;

  return (
    <>
      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="搜索学校名称..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="school-search-input"
          />
        </div>

        <select
          className={styles.selectFilter}
          value={state}
          onChange={(e) => setState(e.target.value)}
          id="state-filter"
        >
          <option value="">全部州属</option>
          {availableStates.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <label className={styles.toggleLabel} id="hostel-filter">
          <input
            type="checkbox"
            checked={hostelOnly}
            onChange={(e) => setHostelOnly(e.target.checked)}
            className={styles.toggleCheckbox}
          />
          <span className={styles.toggleSwitch} />
          <span>仅有宿舍</span>
        </label>

        {activeFilters > 0 && (
          <button
            className={styles.clearBtn}
            onClick={() => { setSearch(''); setState(''); setHostelOnly(false); }}
          >
            清除筛选
          </button>
        )}
      </div>

      {/* Results count */}
      <p className={styles.resultCount}>
        共 <strong>{filtered.length}</strong> 所学校
        {activeFilters > 0 && ` (已筛选)`}
      </p>

      {/* Grid */}
      <div className={styles.grid}>
        {filtered.length > 0 ? (
          filtered.map((school: any) => (
            <Link href={`/schools/${school.slug}`} key={school.documentId} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardMeta}>
                  <span className={styles.badge}>{school.state}</span>
                  {school.has_hostel && <span className={`${styles.badge} ${styles.badgeHostel}`}>🏠 宿舍</span>}
                </div>
              </div>
              <div className={styles.cardBody}>
                <h2>{school.name_zh}</h2>
                <p className={styles.enName}>{school.name_en}</p>
                <div className={styles.details}>
                  <div className={styles.infoRow}>📍 {school.city || school.state}</div>
                  <div className={styles.infoRow}>🚻 {school.school_type === 'Coed' ? '混校' : school.school_type === 'Boys' ? '男校' : '女校'}</div>
                  <div className={styles.infoRow}>🏛️ 建校于 {school.established_year} 年</div>
                  {feeLookup[school.documentId] && (
                    <div className={`${styles.infoRow} ${styles.feeRow}`}>
                      💰 学费约 RM {feeLookup[school.documentId].toLocaleString()}/年
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔍</div>
            <p>没有找到符合条件的学校</p>
            <p className={styles.emptyHint}>尝试调整筛选条件或清除搜索</p>
          </div>
        )}
      </div>
    </>
  );
}
