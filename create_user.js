import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hgaatrpjuqkypamoxdxo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnYWF0cnBqdXFreXBhbW94ZHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTgyODgsImV4cCI6MjA4ODA5NDI4OH0.ALWUtKiumgNwi33xpKUqRICh4z6BtogCU5j8WRGFB44';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createUser() {
    console.log('Creating user syabgy@hani.com...');
    const { data, error } = await supabase.auth.signUp({
        email: 'syabgy@hani.com',
        password: '11059e'
    });

    if (error) {
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created:', data.user?.id);
    }
}
createUser();
