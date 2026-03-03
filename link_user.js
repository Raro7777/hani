import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hgaatrpjuqkypamoxdxo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnYWF0cnBqdXFreXBhbW94ZHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTgyODgsImV4cCI6MjA4ODA5NDI4OH0.ALWUtKiumgNwi33xpKUqRICh4z6BtogCU5j8WRGFB44';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function linkUserToSeller() {
    const userId = '0af44ab9-657d-49bb-a393-d476524d7b9c'; // syabgy@hani.com

    // Find the default seller we created earlier
    const { data: sellers } = await supabase.from('sellers').select('id').limit(1);
    if (sellers && sellers.length > 0) {
        const sellerId = sellers[0].id;

        // Update seller with the new user_id mapping
        console.log(`Linking Auth User ${userId} to Seller ${sellerId}...`);
        const { error } = await supabase.from('sellers')
            .update({ user_id: userId, role: 'ADMIN' })
            .eq('id', sellerId);

        if (error) {
            console.error('Failed to link user. Did you run rls_update.sql on Supabase first? Error:', error.message);
        } else {
            console.log('Successfully linked syabgy to the default store as ADMIN!');
        }
    } else {
        console.log('No default seller found.');
    }
}
linkUserToSeller();
