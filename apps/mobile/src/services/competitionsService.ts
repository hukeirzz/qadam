import { competitions } from '../lib/supabase';

export const listCompetitions = competitions.list;
export const fetchCompetitionById = competitions.fetchById;
export const joinCompetition = competitions.join;
export const fetchCompetitionLeaderboard = competitions.leaderboard;
