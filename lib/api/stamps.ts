import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';

type CalendarStamp = Database['public']['Tables']['calendar_stamp']['Row'];
type CalendarStampInsert = Database['public']['Tables']['calendar_stamp']['Insert'];

export async function insertStamp(stamp: CalendarStampInsert): Promise<CalendarStamp> {
  // Check if stamp already exists for this date
  const existing = await getStampByDate(stamp.pet_id, stamp.walk_date);

  if (existing) {
    // Update existing stamp
    const { data, error } = await supabaseBrowserClient
      .from('calendar_stamp')
      .update({
        stamp_count: (existing.stamp_count || 0) + (stamp.stamp_count || 1),
        goal_achieved: stamp.goal_achieved !== undefined ? stamp.goal_achieved : existing.goal_achieved,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating stamp:', error);
      throw error;
    }

    return data;
  } else {
    // Insert new stamp
    const insert: CalendarStampInsert = {
      pet_id: stamp.pet_id,
      walk_date: stamp.walk_date,
      stamp_count: stamp.stamp_count || 1,
      goal_achieved: stamp.goal_achieved || false,
    };

    const { data, error } = await supabaseBrowserClient
      .from('calendar_stamp')
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error('Error inserting stamp:', error);
      throw error;
    }

    return data;
  }
}

export async function getStampByDate(
  petId: string,
  date: string // YYYY-MM-DD
): Promise<CalendarStamp | null> {
  const { data, error } = await supabaseBrowserClient
    .from('calendar_stamp')
    .select('*')
    .eq('pet_id', petId)
    .eq('walk_date', date)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching stamp:', error);
    throw error;
  }

  return data;
}

export async function getStampsByMonth(
  petId: string,
  year: number,
  month: number
): Promise<CalendarStamp[]> {
  // Get all stamps for the month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

  const { data, error } = await supabaseBrowserClient
    .from('calendar_stamp')
    .select('*')
    .eq('pet_id', petId)
    .gte('walk_date', startDate)
    .lte('walk_date', endDate)
    .order('walk_date', { ascending: true });

  if (error) {
    console.error('Error fetching stamps by month:', error);
    throw error;
  }

  return data || [];
}

export async function getAllStamps(petId: string): Promise<CalendarStamp[]> {
  const { data, error } = await supabaseBrowserClient
    .from('calendar_stamp')
    .select('*')
    .eq('pet_id', petId)
    .order('walk_date', { ascending: false });

  if (error) {
    console.error('Error fetching all stamps:', error);
    throw error;
  }

  return data || [];
}

