import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = 'https://hgaatrpjuqkypamoxdxo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnYWF0cnBqdXFreXBhbW94ZHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTgyODgsImV4cCI6MjA4ODA5NDI4OH0.ALWUtKiumgNwi33xpKUqRICh4z6BtogCU5j8WRGFB44';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAndPrepareSQL() {
    console.log('Creating clean user syabgy@gmail.com...');
    const { data, error } = await supabase.auth.signUp({
        email: 'syabgy@gmail.com',
        password: '11059e'
    });

    if (error) {
        console.error('Error creating user:', error.message);
        return;
    }

    const newUserId = data.user?.id;
    console.log('New User ID:', newUserId);

    const sqlContent = `
DO $$
DECLARE
  new_store_id UUID;
  new_seller_id UUID;
BEGIN
  -- 1. Create default store if not exists
  SELECT id INTO new_store_id FROM stores LIMIT 1;
  IF new_store_id IS NULL THEN
    INSERT INTO stores (name) VALUES ('기본 매장') RETURNING id INTO new_store_id;
  END IF;

  -- 2. Create default seller if not exists
  SELECT id INTO new_seller_id FROM sellers LIMIT 1;
  IF new_seller_id IS NULL THEN
    INSERT INTO sellers (store_id, name, role, user_id) 
    VALUES (new_store_id, '기본 판매자', 'ADMIN', '${newUserId}') 
    RETURNING id INTO new_seller_id;
  ELSE
    -- If seller exists, just update it
    UPDATE sellers SET user_id = '${newUserId}', role = 'ADMIN' WHERE id = new_seller_id;
  END IF;
END $$;
`;

    fs.writeFileSync('link_user_sql2.sql', sqlContent.trim());
    console.log('Created link_user_sql2.sql');
}
createAndPrepareSQL();
