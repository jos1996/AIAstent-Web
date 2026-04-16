import { supabase } from './supabase';

export async function getApiKey(keyName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('key_value')
    .eq('key_name', keyName)
    .eq('is_active', true)
    .single();
  if (error || !data) return null;
  return data.key_value;
}

export async function saveApiKey(keyName: string, keyValue: string, metadata = {}): Promise<boolean> {
  const { error } = await supabase.from('api_keys').upsert(
    { key_name: keyName, key_value: keyValue, metadata, is_active: true },
    { onConflict: 'key_name' }
  );
  return !error;
}
