import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rlqnqohexqewsmcrztvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscW5xb2hleHFld3NtY3J6dHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4Mjk2NjIsImV4cCI6MjA4OTQwNTY2Mn0.C3zquCZlwloc4IE-BBu2JdGilJ9AeNDgBpHRypP6yjk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
