// common/supabase.js
import { createClient } from '@supabase/supabase-js';

// 请替换成你自己的 Supabase 项目URL和anon key
const supabaseUrl = 'https://pazsdtqxxvmhbgwrtrkh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhenNkdHF4eHZtaGJnd3J0cmtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzgzMjIsImV4cCI6MjA2MzQxNDMyMn0.d0zyZDVfRx3dEhK0e0gDyoHy1hjDNURzCiW_2sFNkFg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);