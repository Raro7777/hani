import React, { useState } from 'react';
import { Plus, Minus, Wallet, Receipt, TrendingUp, Trash2 } from 'lucide-react';
import { formatCurrency, CASH_ENTRY_LABELS } from '../lib/utils';
import { Sale, CashLedgerEntry } from '../types';
import './DailyClosing.css';

interface DailyClosingProps {
    date: string;
    sales: Sale[];
}

const DailyClosing: React.FC<DailyClosingProps> = ({ date, sales }) => {
    const [cashEntries, setCashEntries] = useState<CashLedgerEntry[]>(() => {
        const saved = localStorage.getItem(`hani_cash_${date}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [isAdding, setIsAdding] = useState(false);
    const [newEntry, setNewEntry] = useState({ title: '', amount: 0, type: 'EXPENSE' as const });

    const saveEntries = (entries: CashLedgerEntry[]) => {
        setCashEntries(entries);
        localStorage.setItem(`hani_cash_${date}`, JSON.stringify(entries));
    };

    const handleAddEntry = () => {
        if (!newEntry.title || newEntry.amount <= 0) return;
        const entry: CashLedgerEntry = {
            ...newEntry,
            id: crypto.randomUUID(),
            date,
            storeId: 'default'
        };
        saveEntries([...cashEntries, entry]);
        setNewEntry({ title: '', amount: 0, type: 'EXPENSE' });
        setIsAdding(false);
    };

    const handleDeleteEntry = (id: string) => {
        saveEntries(cashEntries.filter(e => e.id !== id));
    };

    const salesNetTotal = sales.reduce((acc, sale) => {
        return acc + sale.items.reduce((sacc, item) => {
            if (item.type === 'REBATE' || item.type === 'EXTRA') return sacc + item.amount;
            if (item.type === 'SUBSIDY') return sacc - item.amount;
            return sacc;
        }, 0);
    }, 0);

    const otherIncomeTotal = cashEntries
        .filter(e => e.type === 'OTHER_INCOME')
        .reduce((acc, e) => acc + e.amount, 0);

    const expenseTotal = cashEntries
        .filter(e => e.type === 'EXPENSE')
        .reduce((acc, e) => acc + e.amount, 0);

    const finalNetTotal = salesNetTotal + otherIncomeTotal - expenseTotal;

    return (
        <div className="closing-container">
            <div className="summary-widgets">
                <div className="widget glass">
                    <div className="widget-header">
                        <TrendingUp size={18} className="text-blue" />
                        <span>판매 실수입</span>
                    </div>
                    <div className="widget-value">{formatCurrency(salesNetTotal)}</div>
                    <div className="widget-footer">{sales.length}건 판매</div>
                </div>
                <div className="widget glass">
                    <div className="widget-header">
                        <Plus size={18} className="text-green" />
                        <span>기타 수입</span>
                    </div>
                    <div className="widget-value">{formatCurrency(otherIncomeTotal)}</div>
                </div>
                <div className="widget glass">
                    <div className="widget-header">
                        <Minus size={18} className="text-red" />
                        <span>지출 합계</span>
                    </div>
                    <div className="widget-value text-red">-{formatCurrency(expenseTotal)}</div>
                </div>
                <div className="widget glass highlight-blue">
                    <div className="widget-header">
                        <Wallet size={18} />
                        <span>오늘의 마감고</span>
                    </div>
                    <div className="widget-value">{formatCurrency(finalNetTotal)}</div>
                    <div className="widget-footer">최종 정산액</div>
                </div>
            </div>

            <div className="closing-grid">
                <section className="closing-section glass">
                    <div className="section-header">
                        <h3><Receipt size={18} /> 현금 장부 (기타 내역)</h3>
                        <button className="btn-small" onClick={() => setIsAdding(true)}><Plus size={14} /> 추가</button>
                    </div>

                    {isAdding && (
                        <div className="add-entry-form">
                            <div className="form-row">
                                <select
                                    value={newEntry.type}
                                    onChange={e => setNewEntry(prev => ({ ...prev, type: e.target.value as any }))}
                                >
                                    <option value="EXPENSE">{CASH_ENTRY_LABELS.EXPENSE}</option>
                                    <option value="OTHER_INCOME">{CASH_ENTRY_LABELS.OTHER_INCOME}</option>
                                    <option value="BANK_DEPOSIT">{CASH_ENTRY_LABELS.BANK_DEPOSIT}</option>
                                </select>
                                <input
                                    placeholder="항목명 (예: 식비, 이월금)"
                                    value={newEntry.title}
                                    onChange={e => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                                />
                                <input
                                    type="number"
                                    placeholder="금액"
                                    value={newEntry.amount}
                                    onChange={e => setNewEntry(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="form-actions">
                                <button className="btn-text" onClick={() => setIsAdding(false)}>취소</button>
                                <button className="btn-primary-small" onClick={handleAddEntry}>등록</button>
                            </div>
                        </div>
                    )}

                    <div className="entries-list">
                        {cashEntries.length > 0 ? cashEntries.map((entry) => (
                            <div key={entry.id} className={`entry-item ${entry.type.toLowerCase()}`}>
                                <div className="entry-info">
                                    <span className="entry-title">{entry.title}</span>
                                    <span className="entry-type">{CASH_ENTRY_LABELS[entry.type]}</span>
                                </div>
                                <div className="entry-amount-block">
                                    <span className="amount">
                                        {entry.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(entry.amount)}
                                    </span>
                                    <button className="btn-icon delete-small" onClick={() => handleDeleteEntry(entry.id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">기록된 현금 흐름이 없습니다.</div>
                        )}
                    </div>
                </section>

                <section className="closing-section glass">
                    <div className="section-header">
                        <h3>마감 확정</h3>
                    </div>
                    <div className="closing-status">
                        <p className="status-text">현재 마감이 완료되지 않았습니다.</p>
                        <textarea placeholder="마감 메모를 입력하세요 (예: 통장입금 내역 등)" rows={4}></textarea>
                        <button className="btn-full primary">오늘 마감 확정하기</button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DailyClosing;
