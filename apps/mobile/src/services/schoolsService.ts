import { schools } from '../lib/supabase';

export const listSchools = schools.list;
export const findSchoolByCode = schools.findByCode;
export const fetchSchoolById = schools.fetchById;
export const findClassByCode = schools.findClassByCode;
export const fetchClassById = schools.fetchClassById;
