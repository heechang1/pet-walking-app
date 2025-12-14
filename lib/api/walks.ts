import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';
import { PathPoint } from '@/types/path.types';

type Walk = Database['public']['Tables']['walks']['Row'];
type WalkInsert = Database['public']['Tables']['walks']['Insert'];

export interface WalkInsertData {
  pet_id: string;
  start_time: string;
  end_time: string;
  duration_sec: number;
  distance_m: number;
  steps?: number;
  path?: {
    coordinates: [number, number][];
    pathPoints?: PathPoint[];
  };
}

export async function insertWalk(walkData: WalkInsertData): Promise<Walk> {
  const insert: WalkInsert = {
    pet_id: walkData.pet_id,
    start_time: walkData.start_time,
    end_time: walkData.end_time,
    duration_sec: walkData.duration_sec,
    distance_m: walkData.distance_m,
    steps: walkData.steps || null,
    path: walkData.path || null,
  };

  const { data, error } = await supabaseBrowserClient
    .from('walks')
    .insert(insert)
    .select()
    .single();

  if (error) {
    console.error('Error inserting walk:', error);
    throw error;
  }

  return data;
}

export async function getWalksByPet(petId: string, limit = 50): Promise<Walk[]> {
  const { data, error } = await supabaseBrowserClient
    .from('walks')
    .select('*')
    .eq('pet_id', petId)
    .order('start_time', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching walks:', error);
    throw error;
  }

  return data || [];
}

export async function getWalksByMonth(
  petId: string,
  year: number,
  month: number
): Promise<Walk[]> {
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabaseBrowserClient
    .from('walks')
    .select('*')
    .eq('pet_id', petId)
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching walks by month:', error);
    throw error;
  }

  return data || [];
}

export async function getWalksByDate(
  petId: string,
  date: string // YYYY-MM-DD
): Promise<Walk[]> {
  const startDate = `${date}T00:00:00.000Z`;
  const endDate = `${date}T23:59:59.999Z`;

  const { data, error } = await supabaseBrowserClient
    .from('walks')
    .select('*')
    .eq('pet_id', petId)
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching walks by date:', error);
    throw error;
  }

  return data || [];
}

