export type Ranking = {
  id: number;
  player_name: string;
  rank_position: number;
  rating: number;
  rounds_played: number;
  valid_from: string;
  is_current: boolean;
};

export type ActivityItem = {
  player_name: string;
  current: Ranking;
  previous: Ranking;
  ratingDiff: number;
  roundsDiff: number;
  rankDiff: number;
  date: string;
};

export type ActivityTier = {
  title: string;
  items: ActivityItem[];
};
