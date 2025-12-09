// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xqkatvrwddkyowikjdtg.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxa2F0dnJ3ZGRreW93aWtqZHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzQ0OTQsImV4cCI6MjA4MDYxMDQ5NH0.VdJwt3R2FCglq0RfZ1hIRYuCQnQbLi0l-9JDw-7giJ0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
