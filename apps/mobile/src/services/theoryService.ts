import { theory } from '../lib/supabase';
import type { TopicTheoryRow } from '@qadam/types';

export type TopicTheory = TopicTheoryRow;

export const fetchTopicTheory = theory.fetchForTopic;
