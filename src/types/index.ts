export type SellerRole = 'ADMIN' | 'MANAGER' | 'SELLER';
export type SaleStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';
export type SettlementType = 'SALE_AMOUNT' | 'SUBSIDY' | 'REBATE' | 'EXTRA' | 'INSTALLMENT';
export type CashEntryType = 'OTHER_INCOME' | 'EXPENSE' | 'BANK_DEPOSIT' | 'OTHER';
export type ActivationType = 'NEW' | 'MNP' | 'CHANGE' | 'OTHER';

export interface Store {
    id: string;
    name: string;
    businessNumber?: string;
    address?: string;
    createdAt: string;
}

export interface Seller {
    id: string;
    storeId: string;
    name: string;
    phone?: string;
    role: SellerRole;
}

export interface Carrier {
    id: string;
    name: string;
    code: string;
}

export interface Sale {
    id: string;
    saleDate: string;
    storeId: string;
    sellerId: string;
    carrierId: string;
    activationType: ActivationType;
    planName: string;
    subscriberName: string;
    phoneNumber: string;
    modelName?: string;
    serialNumber?: string;
    status: SaleStatus;
    memo?: string;
    items: SaleSettlementItem[];
}

export interface SaleSettlementItem {
    id: string;
    saleId: string;
    type: SettlementType;
    amount: number;
    note?: string;
}

export interface CashLedgerEntry {
    id: string;
    date: string;
    storeId: string;
    sellerId?: string;
    type: CashEntryType;
    title: string;
    amount: number;
}

export interface DailyClosing {
    date: string;
    storeId: string;
    salesNetTotal: number;
    otherIncomeTotal: number;
    expenseTotal: number;
    isFixed: boolean;
    memo?: string;
}
