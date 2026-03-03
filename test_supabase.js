import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hgaatrpjuqkypamoxdxo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnYWF0cnBqdXFreXBhbW94ZHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTgyODgsImV4cCI6MjA4ODA5NDI4OH0.ALWUtKiumgNwi33xpKUqRICh4z6BtogCU5j8WRGFB44';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing connection to Supabase...');
    const { data, error } = await supabase.from('carriers').select('*');
    if (error) {
        console.error('Error connecting or querying carriers:', error.message);
    } else {
        console.log('Successfully connected! Carriers found:', data.length);
        console.log(data);
    }
}

testConnection();
