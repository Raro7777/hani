-- Sales Journal SaaS Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE seller_role AS ENUM ('ADMIN', 'MANAGER', 'SELLER');
CREATE TYPE sale_status AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');
CREATE TYPE settlement_type AS ENUM ('SALE_AMOUNT', 'SUBSIDY', 'REBATE', 'EXTRA', 'INSTALLMENT');
CREATE TYPE cash_entry_type AS ENUM ('OTHER_INCOME', 'EXPENSE', 'BANK_DEPOSIT', 'OTHER');

-- 1. Master Data
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    business_number TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    role seller_role NOT NULL DEFAULT 'SELLER',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE carriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- SKT, LG U+, KT, etc.
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sales Transactions
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    store_id UUID NOT NULL REFERENCES stores(id),
    seller_id UUID NOT NULL REFERENCES sellers(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),
    subscriber_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    model_name TEXT,
    serial_number TEXT,
    status sale_status NOT NULL DEFAULT 'OPEN',
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sale_settlement_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    type settlement_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cash Ledger & Closing
CREATE TABLE cash_ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    store_id UUID NOT NULL REFERENCES stores(id),
    seller_id UUID REFERENCES sellers(id),
    type cash_entry_type NOT NULL,
    title TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_closings (
    date DATE NOT NULL,
    store_id UUID NOT NULL REFERENCES stores(id),
    sales_net_total DECIMAL(15, 2) DEFAULT 0,
    other_income_total DECIMAL(15, 2) DEFAULT 0,
    expense_total DECIMAL(15, 2) DEFAULT 0,
    is_fixed BOOLEAN DEFAULT FALSE,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (date, store_id)
);

-- Indexes for performance
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_store ON sales(store_id);
CREATE INDEX idx_cash_ledger_date ON cash_ledger_entries(date);

-- Initial Data
INSERT INTO carriers (name, code) VALUES 
('SKT', 'SKT'),
('LG U+', 'LGU'),
('KT', 'KT');
