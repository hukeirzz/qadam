import { rating } from '../lib/supabase';

export const fetchGlobalRating = rating.global;
export const fetchSchoolRating = rating.school;
export const fetchClassRating = rating.classRank;
