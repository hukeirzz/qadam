import { supabase } from '../lib/supabase';

export interface TopicTheory {
  id: string;
  topic_id: string;
  subject_id: string;
  title: string;
  content: string;
}

export async function fetchTopicTheory(topicId: string): Promise<TopicTheory | null> {
  const { data, error } = await supabase
    .from('topic_theories')
    .select('id, topic_id, subject_id, title, content')
    .eq('topic_id', topicId)
    .single();

  if (error || !data) return null;
  return data as TopicTheory;
}
