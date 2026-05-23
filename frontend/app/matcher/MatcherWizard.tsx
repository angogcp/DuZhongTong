'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface MatcherWizardProps {
  schools: any[];
}

export default function MatcherWizard({ schools }: MatcherWizardProps) {
  const [step, setStep] = useState(1);
  const [prefState, setPrefState] = useState<string>('Any');
  const [prefHostel, setPrefHostel] = useState<string>('Any'); // 'Yes', 'No', 'Any'
  const [prefBudget, setPrefBudget] = useState<number>(0); // 0 = No Limit
  
  const [results, setResults] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Derive unique states from schools dynamically
  const availableStates = Array.from(new Set(schools.map(s => s.state).filter(Boolean)));

  const handleCalculate = () => {
    setIsCalculating(true);
    setStep(4);
    
    setTimeout(() => {
      // Basic Matching Engine
      const scored = schools.map(s => {
        let score = 0;
        let reasons = [];

        // 1. State check
        if (prefState === 'Any') {
          score += 10;
        } else if (s.state === prefState) {
          score += 30; // High weight for exact state match
          reasons.push('✅ 州属完全匹配');
        } else {
          score -= 20; // Penalty for wrong state
          reasons.push('❌ 州属不符');
        }

        // 2. Hostel check
        if (prefHostel === 'Any') {
          score += 10;
        } else if (prefHostel === 'Yes' && s.has_hostel) {
          score += 40; // High weight
          reasons.push('✅ 提供学生宿舍');
        } else if (prefHostel === 'Yes' && !s.has_hostel) {
          score -= 50; // Dealbreaker
          reasons.push('⛔ 无学生宿舍');
        } else if (prefHostel === 'No') {
          score += 10; // Doesn't matter if they have it
        }

        // 3. Budget check
        // Calculate estimated total
        let estTotal = s.school_fees?.total_yearly || 0;
        if (prefHostel === 'Yes') {
           estTotal += (s.hostel?.monthly_fee ? s.hostel.monthly_fee * 11 : 0);
        }
        
        if (prefBudget === 0) {
          score += 10;
        } else {
          if (estTotal > 0 && estTotal <= prefBudget) {
            score += 30;
            reasons.push(`✅ 预算内 (约 RM ${estTotal.toLocaleString()}/年)`);
          } else if (estTotal > prefBudget) {
            score -= 30;
            reasons.push(`⚠️ 超出预算 (约 RM ${estTotal.toLocaleString()}/年)`);
          } else {
            // Est total is 0 (data missing)
            score += 5; // give benefit of doubt
          }
        }

        return { ...s, matchScore: score, matchReasons: reasons };
      });

      // Sort by score desc, filter out dealbreakers, return top 3
      const ranked = scored
        .filter(s => s.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);
        
      setResults(ranked);
      setIsCalculating(false);
    }, 1200); // Simulate AI thinking delay for UX
  };

  const reset = () => {
    setStep(1);
    setPrefState('Any');
    setPrefHostel('Any');
    setPrefBudget(0);
    setResults([]);
  };

  return (
    <div className={styles.wizardContainer}>
      {/* Progress Bar */}
      {step < 5 && (
        <div className={styles.progressTracker}>
          <div className={styles.progressFill} style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <div className={`${styles.stepBox} fade-in`}>
          <h2>第一步：地点偏好 🗺️</h2>
          <p>您打算让孩子在哪一个州属就读独中？</p>
          <div className={styles.optionsGrid}>
            <button 
              className={`${styles.optionBtn} ${prefState === 'Any' ? styles.active : ''}`}
              onClick={() => setPrefState('Any')}
            >暂无限制 / 都可以</button>
            {availableStates.map(state => (
              <button 
                key={state}
                className={`${styles.optionBtn} ${prefState === state ? styles.active : ''}`}
                onClick={() => setPrefState(state)}
              >{state}</button>
            ))}
          </div>
          <div className={styles.navButtons}>
            <span /> {/* Spacer */}
            <button className={styles.nextBtn} onClick={() => setStep(2)}>下一步 →</button>
          </div>
        </div>
      )}

      {/* Step 2: Hostel */}
      {step === 2 && (
        <div className={`${styles.stepBox} fade-in`}>
          <h2>第二步：住宿考量 🛏️</h2>
          <p>孩子是否需要入住学校提供的学生宿舍？</p>
          <div className={styles.optionsGrid}>
            <button 
              className={`${styles.optionBtn} ${prefHostel === 'Yes' ? styles.active : ''}`}
              onClick={() => setPrefHostel('Yes')}
            >是的，必须有宿舍</button>
            <button 
              className={`${styles.optionBtn} ${prefHostel === 'No' ? styles.active : ''}`}
              onClick={() => setPrefHostel('No')}
            >不需要，走读即可</button>
            <button 
              className={`${styles.optionBtn} ${prefHostel === 'Any' ? styles.active : ''}`}
              onClick={() => setPrefHostel('Any')}
            >暂未决定</button>
          </div>
          <div className={styles.navButtons}>
            <button className={styles.backBtn} onClick={() => setStep(1)}>← 返回</button>
            <button className={styles.nextBtn} onClick={() => setStep(3)}>下一步 →</button>
          </div>
        </div>
      )}

      {/* Step 3: Budget */}
      {step === 3 && (
        <div className={`${styles.stepBox} fade-in`}>
          <h2>第三步：年度预算 💰</h2>
          <p>您对孩子第一年入学的总预算（含学费、杂费），若需住宿则连同住宿费一同考量，最高限额大约是多少？</p>
          <div className={styles.optionsGridVertical}>
            <button className={`${styles.optionBtn} ${prefBudget === 0 ? styles.active : ''}`} onClick={() => setPrefBudget(0)}>
              预算充足，品质优先 (无限制)
            </button>
            <button className={`${styles.optionBtn} ${prefBudget === 12000 ? styles.active : ''}`} onClick={() => setPrefBudget(12000)}>
              每年 RM 12,000 以内 (约每月 RM1k)
            </button>
            <button className={`${styles.optionBtn} ${prefBudget === 8000 ? styles.active : ''}`} onClick={() => setPrefBudget(8000)}>
              每年 RM 8,000 以内 (中等预算)
            </button>
            <button className={`${styles.optionBtn} ${prefBudget === 5000 ? styles.active : ''}`} onClick={() => setPrefBudget(5000)}>
              每年 RM 5,000 以内 (高性价比)
            </button>
          </div>
          <div className={styles.navButtons}>
            <button className={styles.backBtn} onClick={() => setStep(2)}>← 返回</button>
            <button className={styles.submitBtn} onClick={handleCalculate}>开始匹配 ✨</button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && (
        <div className={`${styles.stepBox} fade-in`}>
          {isCalculating ? (
            <div className={styles.calculatingState}>
              <div className={styles.spinner}></div>
              <h3>正在为您匹配最适合的学校...</h3>
              <p>系统正根据 州属、宿舍供应及费用数据 进行交叉比对</p>
            </div>
          ) : (
            <div className={styles.resultsState}>
              <h2 className={styles.resultTitle}>🎯 这是最适合您的学校推荐</h2>
              {results.length === 0 ? (
                 <div className={styles.emptyMatch}>
                   <p>抱歉，我们在库中未能找到完全符合您严苛条件的学校。</p>
                   <p>建议放宽“州属”或“预算”限制后再次尝试。</p>
                 </div>
              ) : (
                <div className={styles.matchGrid}>
                  {results.map((r, idx) => (
                    <div key={r.documentId} className={styles.matchCard}>
                      <div className={styles.matchBadge}>Top {idx + 1} 推荐</div>
                      <h3>{r.name_zh}</h3>
                      <p className={styles.schoolLocation}>{r.state} · {r.city}</p>
                      
                      <div className={styles.matchReasons}>
                        {r.matchReasons.map((reason: string, i: number) => (
                          <div key={i} className={styles.reasonLine}>{reason}</div>
                        ))}
                      </div>

                      <Link href={`/schools/${r.slug}`} className={styles.detailsBtn}>
                        查看学校详情 →
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.actionRow}>
                <button className={styles.retryBtn} onClick={reset}>重新匹配 ↺</button>
                {results.length > 0 && (
                  <Link href={`/compare?s=${results.map(r => r.slug).join(',')}`} className={styles.compareBtn}>
                    将推荐结果加入横向对比 ⚖️
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
