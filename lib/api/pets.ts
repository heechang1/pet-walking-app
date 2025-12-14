import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';

type Pet = Database['public']['Tables']['pets']['Row'];
type PetInsert = Database['public']['Tables']['pets']['Insert'];
type PetUpdate = Database['public']['Tables']['pets']['Update'];

export async function getPets(userId: string): Promise<Pet[]> {
  const { data, error } = await supabaseBrowserClient
    .from('pets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pets:', error);
    throw error;
  }

  return data || [];
}

export async function getPet(id: string): Promise<Pet | null> {
  const { data, error } = await supabaseBrowserClient
    .from('pets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching pet:', error);
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw error;
  }

  return data;
}

export async function insertPet(pet: PetInsert): Promise<Pet> {
  const { data, error } = await supabaseBrowserClient
    .from('pets')
    .insert(pet)
    .select()
    .single();

  if (error) {
    console.error('Error inserting pet:', error);
    throw error;
  }

  return data;
}

export async function updatePet(id: string, updates: PetUpdate): Promise<Pet> {
  const { data, error } = await supabaseBrowserClient
    .from('pets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating pet:', error);
    throw error;
  }

  return data;
}

export async function deletePet(id: string): Promise<void> {
  const { error } = await supabaseBrowserClient
    .from('pets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting pet:', error);
    throw error;
  }
}

