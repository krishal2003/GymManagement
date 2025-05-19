// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vegvniibkomhqaripajj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3ZuaWlia29taHFhcmlwYWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTE4NTUsImV4cCI6MjA2MzIyNzg1NX0.0X3DNPCfHslTuQfHKRPZli3iQToM2pm0xVz8QgO08Yw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
