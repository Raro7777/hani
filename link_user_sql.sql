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
    VALUES (new_store_id, '기본 판매자', 'ADMIN', 'c44cf410-ad4e-49de-b904-cd9095d34560') 
    RETURNING id INTO new_seller_id;
  ELSE
    -- If seller exists, just update it
    UPDATE sellers SET user_id = 'c44cf410-ad4e-49de-b904-cd9095d34560', role = 'ADMIN' WHERE id = new_seller_id;
  END IF;
END $$;
