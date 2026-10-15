import React from 'react';
import { HeroFairScore } from './HeroFairScore';

export function SafetyGauge({ score = 92, grade = 'Elite Safe Driver', metrics, qualityInfo }) {
  return (
    <HeroFairScore
      score={score}
      grade={grade}
      metrics={metrics}
      quote={{ finalPremium: 67.0, basePremium: 100.0, totalSaved: 33.0 }}
    />
  );
}
