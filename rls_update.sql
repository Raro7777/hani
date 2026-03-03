-- RLS and User Mapping Update

-- 1. Add user_id to sellers (maps to Supabase Auth)
ALTER TABLE sellers ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_settlement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_ledger_entries ENABLE ROW LEVEL SECURITY;

-- 3. Simple Policies to avoid recursion
-- Everyone logged in can view stores
CREATE POLICY "View all stores" ON stores FOR SELECT TO authenticated USING (true);

-- Everyone logged in can view sellers
CREATE POLICY "View all sellers" ON sellers FOR SELECT TO authenticated USING (true);

-- Sales: Users can only read/write sales for their assigned store
CREATE POLICY "Manage store sales" ON sales FOR ALL TO authenticated USING (
    store_id IN (SELECT store_id FROM sellers WHERE user_id = auth.uid())
);

-- Sale Items: Managed via their associated sale
CREATE POLICY "Manage sale items" ON sale_settlement_items FOR ALL TO authenticated USING (
    sale_id IN (
        SELECT id FROM sales WHERE store_id IN (
            SELECT store_id FROM sellers WHERE user_id = auth.uid()
        )
    )
);

-- Cash Ledger: Users can only read/write cash entries for their assigned store
CREATE POLICY "Manage store cash ledger" ON cash_ledger_entries FOR ALL TO authenticated USING (
    store_id IN (SELECT store_id FROM sellers WHERE user_id = auth.uid())
);
