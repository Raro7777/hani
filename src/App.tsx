import { useState, useEffect } from 'react';
import MainLayout from './layout/MainLayout';
import SaleForm from './components/SaleForm';
import { formatCurrency, calculateNetIncome, exportToExcel, ACTIVATION_TYPE_LABELS } from './lib/utils';
import { Carrier, Sale } from './types';
import DailyClosing from './components/DailyClosing';
import Analytics from './components/Analytics';
import './App.css';

const MOCK_CARRIERS: Carrier[] = [
    { id: 'skt', name: 'SKT', code: 'SKT' },
    { id: 'kt', name: 'KT', code: 'KT' },
    { id: 'lg', name: 'LG U+', code: 'LGU' },
];

import { Trash2, Plus } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState<'sales' | 'closing' | 'reports'>('sales');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [sales, setSales] = useState<Sale[]>(() => {
        const saved = localStorage.getItem('hani_sales');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('hani_sales', JSON.stringify(sales));
    }, [sales]);

    const handleSaleSubmit = (newSaleData: Omit<Sale, 'id'>) => {
        const newSale: Sale = {
            ...newSaleData,
            id: crypto.randomUUID()
        };
        setSales(prev => [newSale, ...prev]);
    };

    const handleSaleDelete = (id: string) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            setSales(prev => prev.filter(s => s.id !== id));
        }
    };

    const todayString = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.saleDate === todayString);
    const totalNetIncome = sales.reduce((acc, s) => acc + calculateNetIncome(s.items), 0);

    return (
        <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === 'sales' && (
                <>
                    <div className="dashboard-grid">
                        <div className="stat-card">
                            <span className="stat-label">오늘의 건수</span>
                            <span className="stat-value">{todaySales.length}건</span>
                            <span className="stat-change positive">+{sales.length} 전체</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">누적 실수입</span>
                            <span className="stat-value">{formatCurrency(totalNetIncome)}</span>
                            <span className="stat-change positive">+100% (현금기준)</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">최근 등록자</span>
                            <span className="stat-value">{sales[0]?.subscriberName || '-'}</span>
                            <span className="stat-change warning">
                                {sales[0] ? MOCK_CARRIERS.find(c => c.id === sales[0].carrierId)?.name : '내역 없음'}
                            </span>
                        </div>
                    </div>

                    <div className="table-container glass">
                        <div className="table-header">
                            <h3>최근 판매 내역</h3>
                            <div className="table-actions">
                                <button className="btn-secondary-outline" onClick={() => {
                                    const exportData = sales.map(s => ({
                                        판매일자: s.saleDate,
                                        통신사: MOCK_CARRIERS.find(c => c.id === s.carrierId)?.name,
                                        가입자명: s.subscriberName,
                                        생년월일: s.birthDate,
                                        요금제변경일: s.planChangeDate,
                                        모델명: s.modelName,
                                        실수입: calculateNetIncome(s.items)
                                    }));
                                    exportToExcel(exportData, `hani_sales_${new Date().toISOString().split('T')[0]}`);
                                }}>엑셀 다운로드</button>
                                <button className="btn-primary" onClick={() => setIsFormOpen(true)}>신규 등록</button>
                            </div>
                        </div>
                        <div className="table-wrapper">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>번호</th>
                                        <th>날짜</th>
                                        <th>통신사</th>
                                        <th>유형</th>
                                        <th>요금제</th>
                                        <th>가입자</th>
                                        <th>모델명</th>
                                        <th>판매금액</th>
                                        <th>실수입</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.length > 0 ? (
                                        sales.map((sale, idx) => {
                                            const saleAmount = sale.items.find(i => i.type === 'SALE_AMOUNT')?.amount || 0;
                                            const netIncome = calculateNetIncome(sale.items);
                                            const carrier = MOCK_CARRIERS.find(c => c.id === sale.carrierId);

                                            return (
                                                <tr key={sale.id}>
                                                    <td>{sales.length - idx}</td>
                                                    <td>{sale.saleDate}</td>
                                                    <td><span className={`badge ${sale.carrierId.toLowerCase()}`}>
                                                        {carrier?.name || '기타'}
                                                    </span></td>
                                                    <td>{ACTIVATION_TYPE_LABELS[sale.activationType] || sale.activationType}</td>
                                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{sale.planName || '-'}</td>
                                                    <td>{sale.subscriberName}</td>
                                                    <td>{sale.modelName || '-'}</td>
                                                    <td>{formatCurrency(saleAmount)}</td>
                                                    <td className="text-primary" style={{ fontWeight: 700 }}>{formatCurrency(netIncome)}</td>
                                                    <td>
                                                        <button className="btn-icon delete" onClick={() => handleSaleDelete(sale.id)}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                                등록된 판매 내역이 없습니다. '신규 등록' 버튼을 눌러 시작하세요.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'closing' && (
                <DailyClosing date={todayString} sales={todaySales} />
            )}

            {activeTab === 'reports' && (
                <Analytics sales={sales} />
            )}

            {isFormOpen && (
                <SaleForm
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={handleSaleSubmit}
                    carriers={MOCK_CARRIERS}
                />
            )}

            <button className="fab-button" onClick={() => setIsFormOpen(true)} aria-label="신규 등록">
                <Plus size={28} />
            </button>
        </MainLayout>
    );
}

export default App;
