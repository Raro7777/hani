import { useState, useEffect } from 'react';
import MainLayout from './layout/MainLayout';
import SaleForm from './components/SaleForm';
import { formatCurrency, calculateNetIncome, exportToExcel, ACTIVATION_TYPE_LABELS } from './lib/utils';
import { Carrier, Sale } from './types';
import DailyClosing from './components/DailyClosing';
import Analytics from './components/Analytics';
import DateCalculator from './components/DateCalculator';
import History from './components/History';
import './App.css';

import { supabase } from './lib/supabase';
import { Trash2, Plus, Edit2 } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState<'sales' | 'closing' | 'reports' | 'history'>('sales');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSale, setEditingSale] = useState<Sale | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
    const [sales, setSales] = useState<Sale[]>([]);
    const [carriers, setCarriers] = useState<Carrier[]>([]);
    const [defaultStoreId, setDefaultStoreId] = useState<string>('');
    const [defaultSellerId, setDefaultSellerId] = useState<string>('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        const { data: storeData } = await supabase.from('stores').select('id').limit(1);
        const { data: sellerData } = await supabase.from('sellers').select('id').limit(1);

        if (storeData && storeData.length > 0) setDefaultStoreId(storeData[0].id);
        if (sellerData && sellerData.length > 0) setDefaultSellerId(sellerData[0].id);

        const { data: carrierData } = await supabase.from('carriers').select('*');
        if (carrierData) setCarriers(carrierData);

        fetchSales();
    };

    const fetchSales = async () => {
        const { data, error } = await supabase
            .from('sales')
            .select(`
                *,
                sale_settlement_items (*)
            `)
            .order('sale_date', { ascending: false });

        if (!error && data) {
            const formattedSales: Sale[] = data.map(dbSale => ({
                id: dbSale.id,
                saleDate: dbSale.sale_date,
                storeId: dbSale.store_id,
                sellerId: dbSale.seller_id,
                carrierId: dbSale.carrier_id,
                activationType: dbSale.activationType || 'NEW', // Assuming activationType mapping later or keeping it simple
                planName: dbSale.plan_name || '',
                subscriberName: dbSale.subscriber_name,
                birthDate: dbSale.birth_date || '',
                planChangeDate: dbSale.plan_change_date || '',
                additionalServiceChangeDate: dbSale.additional_service_change_date || '',
                phoneNumber: dbSale.phone_number,
                modelName: dbSale.model_name || '',
                serialNumber: dbSale.serial_number || '',
                status: dbSale.status,
                memo: dbSale.memo || '',
                items: dbSale.sale_settlement_items.map((i: any) => ({
                    id: i.id,
                    saleId: i.sale_id,
                    type: i.type,
                    amount: Number(i.amount),
                    note: i.note
                }))
            }));
            setSales(formattedSales);
        }
    };

    const handleSaleSubmit = async (newSaleData: Omit<Sale, 'id'> | Sale) => {
        const isEditing = 'id' in newSaleData && newSaleData.id;
        const saleRecord = {
            sale_date: newSaleData.saleDate,
            store_id: defaultStoreId,
            seller_id: defaultSellerId,
            carrier_id: newSaleData.carrierId,
            subscriber_name: newSaleData.subscriberName,
            phone_number: newSaleData.phoneNumber,
            model_name: newSaleData.modelName,
            status: newSaleData.status || 'OPEN',
            memo: newSaleData.memo
        };

        if (isEditing) {
            await supabase.from('sales').update(saleRecord).eq('id', newSaleData.id);
            // Updating items is complex (upsert/delete). A simple way is to delete all existing and re-insert:
            await supabase.from('sale_settlement_items').delete().eq('sale_id', newSaleData.id);
            const itemsToInsert = newSaleData.items.map(item => ({
                sale_id: newSaleData.id,
                type: item.type,
                amount: item.amount,
                note: item.note
            }));
            await supabase.from('sale_settlement_items').insert(itemsToInsert);
        } else {
            const { data, error } = await supabase.from('sales').insert([saleRecord]).select();
            if (!error && data && data.length > 0) {
                const insertedId = data[0].id;
                const itemsToInsert = newSaleData.items.map(item => ({
                    sale_id: insertedId,
                    type: item.type,
                    amount: item.amount,
                    note: item.note
                }));
                await supabase.from('sale_settlement_items').insert(itemsToInsert);
            }
        }

        fetchSales();
    };

    const handleSaleDelete = async (id: string) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            await supabase.from('sales').delete().eq('id', id);
            fetchSales();
        }
    };

    const todayString = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.saleDate === todayString);
    const monthlySales = sales.filter(s => s.saleDate.startsWith(selectedMonth));
    const monthlyNetIncome = monthlySales.reduce((acc, s) => acc + calculateNetIncome(s.items), 0);

    return (
        <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === 'sales' && (
                <>
                    <div className="month-selector-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-glass)', background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, outline: 'none' }}
                        />
                    </div>
                    <div className="dashboard-grid">
                        <div className="stat-card">
                            <span className="stat-label">오늘의 건수</span>
                            <span className="stat-value">{todaySales.length}건</span>
                            <span className="stat-change positive">이번 달 {monthlySales.length}건</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">월별 실수입</span>
                            <span className="stat-value">{formatCurrency(monthlyNetIncome)}</span>
                            <span className="stat-change positive">해당 월 누적</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">최근 등록자</span>
                            <span className="stat-value">{monthlySales[0]?.subscriberName || '-'}</span>
                            <span className="stat-change warning">
                                {monthlySales[0] ? carriers.find(c => c.id === monthlySales[0].carrierId)?.name : '내역 없음'}
                            </span>
                        </div>
                    </div>

                    <div className="table-container glass">
                        <div className="table-header">
                            <h3>최근 판매 내역</h3>
                            <div className="table-actions">
                                <button className="btn-secondary-outline" onClick={() => {
                                    const exportData = monthlySales.map(s => ({
                                        판매일자: s.saleDate,
                                        통신사: carriers.find(c => c.id === s.carrierId)?.name,
                                        가입자명: s.subscriberName,
                                        생년월일: s.birthDate,
                                        요금제변경일: s.planChangeDate,
                                        부가서비스변경일: s.additionalServiceChangeDate,
                                        모델명: s.modelName,
                                        실수입: calculateNetIncome(s.items)
                                    }));
                                    exportToExcel(exportData, `hani_sales_${selectedMonth}`);
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
                                    {monthlySales.length > 0 ? (
                                        monthlySales.map((sale, idx) => {
                                            const saleAmount = sale.items.find(i => i.type === 'SALE_AMOUNT')?.amount || 0;
                                            const netIncome = calculateNetIncome(sale.items);
                                            const carrier = carriers.find(c => c.id === sale.carrierId);

                                            return (
                                                <tr key={sale.id}>
                                                    <td>{monthlySales.length - idx}</td>
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
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                            <button className="btn-icon" onClick={() => { setEditingSale(sale); setIsFormOpen(true); }} style={{ color: 'var(--text-primary)' }}>
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button className="btn-icon delete" onClick={() => handleSaleDelete(sale.id)}>
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
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
                <DailyClosing date={todayString} sales={todaySales} storeId={defaultStoreId} />
            )}

            {activeTab === 'reports' && (
                <Analytics sales={monthlySales} />
            )}

            {activeTab === 'history' && (
                <History
                    sales={sales}
                    carriers={carriers}
                    onEdit={(sale) => {
                        setEditingSale(sale);
                        setIsFormOpen(true);
                    }}
                    onDelete={handleSaleDelete}
                />
            )}

            {isFormOpen && (
                <SaleForm
                    initialData={editingSale || undefined}
                    onClose={() => {
                        setIsFormOpen(false);
                        setEditingSale(null);
                    }}
                    onSubmit={handleSaleSubmit}
                    carriers={carriers}
                />
            )}

            <button className="fab-button" onClick={() => setIsFormOpen(true)} aria-label="신규 등록">
                <Plus size={28} />
            </button>
            <DateCalculator />
        </MainLayout>
    );
}

export default App;
