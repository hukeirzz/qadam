import { schoolTests } from '../lib/supabase';

export const fetchSchoolTests = schoolTests.list;
export const fetchSchoolTestQuestions = schoolTests.fetchQuestions;
export const submitSchoolTestResult = schoolTests.submitResult;
