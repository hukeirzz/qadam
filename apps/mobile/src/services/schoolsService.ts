import { schools } from '../lib/supabase';

export const listSchools = schools.list;
export const findClassByCode = schools.findClassByCode;
export const fetchClassById = schools.fetchClassById;
