import { PracticeQuestion } from './types';

// Lazily loaded question maps per subject
let mathQ: Record<string, PracticeQuestion[]> | null = null;
let geoQ: Record<string, PracticeQuestion[]> | null = null;
let anaQ: Record<string, PracticeQuestion[]> | null = null;
let readQ: Record<string, PracticeQuestion[]> | null = null;
let gramQ: Record<string, PracticeQuestion[]> | null = null;

function getMath() {
  if (!mathQ) {
    try { mathQ = require('./math').questions; } catch { mathQ = {}; }
  }
  return mathQ!;
}
function getGeo() {
  if (!geoQ) {
    try { geoQ = require('./geometry').questions; } catch { geoQ = {}; }
  }
  return geoQ!;
}
function getAna() {
  if (!anaQ) {
    try { anaQ = require('./analogies').questions; } catch { anaQ = {}; }
  }
  return anaQ!;
}
function getRead() {
  if (!readQ) {
    try { readQ = require('./reading').questions; } catch { readQ = {}; }
  }
  return readQ!;
}
function getGram() {
  if (!gramQ) {
    try { gramQ = require('./grammar').questions; } catch { gramQ = {}; }
  }
  return gramQ!;
}

const MATH_IDS = ['m1','m2','m3','m4','m5','m6','m7','m8','m9','m10'];
const GEO_IDS  = ['g1','g2','g3','g4','g5'];
const ANA_IDS  = ['a1','a2','a3','a4','a5','a6'];
const READ_IDS = ['r1','r2','r3','r4'];
const GRAM_IDS = ['gr1','gr2','gr5','gr6','gr7','gr8','gr9','gr10','gr11'];

export function getQuestionsForTopic(topicId: string): PracticeQuestion[] {
  let map: Record<string, PracticeQuestion[]> = {};
  if (MATH_IDS.includes(topicId))  map = getMath();
  else if (GEO_IDS.includes(topicId))  map = getGeo();
  else if (ANA_IDS.includes(topicId))  map = getAna();
  else if (READ_IDS.includes(topicId)) map = getRead();
  else if (GRAM_IDS.includes(topicId)) map = getGram();
  return map[topicId] ?? [];
}
