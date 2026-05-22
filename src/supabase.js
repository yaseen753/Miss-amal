import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://baxdduqbnvobosaubcyz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJheGRkdXFibnZvYm9zYXViY3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MDA3OTMsImV4cCI6MjA5NDk3Njc5M30.FFaS5Dlb2kuT07uBga6llWZLM4ArWqX826Zfv_klk8w'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function loadMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data
}

export async function saveMessage(text) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ text }])
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}
