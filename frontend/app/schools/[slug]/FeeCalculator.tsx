'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface FeeCalculatorProps {
  fees: {
    registration_fee?: number;
    tuition_fee?: number;
    misc_fee?: number;
    hostel_fee?: number;
    total_yearly?: number;
  };
  hostel?: {
    monthly_fee?: number;
  };
}

export default function FeeCalculator({ fees, hostel }: FeeCalculatorProps) {
  const [isNewStudent, setIsNewStudent] = useState(true);
  const [includeHostel, setIncludeHostel] = useState(false);

  // Parse values
  const regFee = fees.registration_fee || 0;
  const tuition = fees.tuition_fee || 0;
  const misc = fees.misc_fee || 0;
  
  // Some schools store hostel in fees.hostel_fee, others we estimate by hostel.monthly_fee * 11
  let calculatedHostelFee = fees.hostel_fee || 0;
  if (!calculatedHostelFee && hostel && hostel.monthly_fee) {
    calculatedHostelFee = hostel.monthly_fee * 11; // 11 academic months typical
  }

  // Calculation
  let total = tuition + misc;
  if (isNewStudent) total += regFee;
  if (includeHostel) total += calculatedHostelFee;

  return (
    <div className={styles.calculatorWrapper}>
      <div className={styles.calcControls}>
        <label className={styles.calcToggle}>
          <input 
            type="checkbox" 
            checked={isNewStudent} 
            onChange={(e) => setIsNewStudent(e.target.checked)} 
          />
          包含新生注册费 (RM {regFee.toLocaleString()})
        </label>
        
        {(fees.hostel_fee || hostel) && (
          <label className={styles.calcToggle}>
            <input 
              type="checkbox" 
              checked={includeHostel} 
              onChange={(e) => setIncludeHostel(e.target.checked)} 
            />
            包含全年住宿费预估 (RM {calculatedHostelFee.toLocaleString()})
          </label>
        )}
      </div>

      <div className={styles.feeGrid}>
        {isNewStudent && regFee > 0 && (
          <div className={styles.feeItem}><span>首次注册费</span><strong>RM {regFee.toLocaleString()}</strong></div>
        )}
        <div className={styles.feeItem}><span>学费/年</span><strong>RM {tuition.toLocaleString()}</strong></div>
        {misc > 0 && (
          <div className={styles.feeItem}><span>杂费与活动</span><strong>RM {misc.toLocaleString()}</strong></div>
        )}
        {includeHostel && calculatedHostelFee > 0 && (
          <div className={styles.feeItem}><span>住宿费/年</span><strong>RM {calculatedHostelFee.toLocaleString()}</strong></div>
        )}
        
        <div className={styles.feeItemTotalCalc}>
          <span>个人全年预估 (RM)</span>
          <strong>RM {total.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}
