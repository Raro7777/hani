import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hgaatrpjuqkypamoxdxo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnYWF0cnBqdXFreXBhbW94ZHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTgyODgsImV4cCI6MjA4ODA5NDI4OH0.ALWUtKiumgNwi33xpKUqRICh4z6BtogCU5j8WRGFB44';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDefaults() {
    let { data: storeData } = await supabase.from('stores').select('*').limit(1);
    let storeId;
    if (!storeData || storeData.length === 0) {
        console.log('Creating default store...');
        const { data, error } = await supabase.from('stores').insert([{ name: '기본 매장' }]).select();
        if (error) throw error;
        storeId = data[0].id;
    } else {
        storeId = storeData[0].id;
    }

    let { data: sellerData } = await supabase.from('sellers').select('*').limit(1);
    let sellerId;
    if (!sellerData || sellerData.length === 0) {
        console.log('Creating default seller...');
        const { data, error } = await supabase.from('sellers').insert([{ store_id: storeId, name: '기본 판매자' }]).select();
        if (error) throw error;
        sellerId = data[0].id;
    } else {
        sellerId = sellerData[0].id;
    }

    console.log('Default Store ID:', storeId);
    console.log('Default Seller ID:', sellerId);
}

setupDefaults();
