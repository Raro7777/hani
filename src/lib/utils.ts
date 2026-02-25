import { SaleSettlementItem } from '../types';

/**
 * 실수입(Net Income) 계산식:
 * 실수입 = Rebate(R) + Extra(추가) - Subsidy(보조금)
 * 
 * *판매대금(Sale Amount)과 할부(Installment)는 현금 흐름 성격에 따라 
 * 추가 항목으로 계산될 수 있지만, 기본은 수수료 기반 정산입니다.
 */
export const calculateNetIncome = (items: SaleSettlementItem[]): number => {
    return items.reduce((acc, item) => {
        switch (item.type) {
            case 'REBATE':
            case 'EXTRA':
                return acc + item.amount;
            case 'SUBSIDY':
                return acc - item.amount;
            // SALE_AMOUNT and INSTALLMENT are treated as neutral for net income
            // unless specifically defined as cash income/expense
            default:
                return acc;
        }
    }, 0);
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
    }).format(amount);
};

export const SETTLEMENT_LABELS: Record<string, string> = {
    SALE_AMOUNT: '판매대금',
    SUBSIDY: '보조금',
    REBATE: '리베이트(R)',
    EXTRA: '추가정산',
    INSTALLMENT: '할부금',
};

export const CASH_ENTRY_LABELS: Record<string, string> = {
    OTHER_INCOME: '기타수입',
    EXPENSE: '지출',
    BANK_DEPOSIT: '통장입금',
    OTHER: '기타',
};

export const STATUS_LABELS: Record<string, string> = {
    OPEN: '대기',
    CLOSED: '확정',
    CANCELLED: '취소',
};

export const ACTIVATION_TYPE_LABELS: Record<string, string> = {
    NEW: '신규',
    MNP: '번호이동',
    CHANGE: '기기변경',
    OTHER: '기타',
};

import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
