import React, { useState, useMemo } from 'react';
import { Search, Filter, Edit2, Trash2 } from 'lucide-react';
import { Sale, Carrier } from '../types';
import { calculateNetIncome, formatCurrency, ACTIVATION_TYPE_LABELS } from '../lib/utils';
import './History.css';

interface HistoryProps {
    sales: Sale[];
    carriers: Carrier[];
    onEdit: (sale: Sale) => void;
    onDelete: (id: string) => void;
}

const History: React.FC<HistoryProps> = ({ sales, carriers, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCarrier, setFilterCarrier] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');
    const [filterMonth, setFilterMonth] = useState(''); // empty means all or specific month YYYY-MM

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const matchesSearch =
                sale.subscriberName.includes(searchTerm) ||
                sale.phoneNumber.includes(searchTerm) ||
                (sale.modelName && sale.modelName.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCarrier = filterCarrier === 'ALL' || sale.carrierId === filterCarrier;
            const matchesType = filterType === 'ALL' || sale.activationType === filterType;
            const matchesMonth = !filterMonth || sale.saleDate.startsWith(filterMonth);

            return matchesSearch && matchesCarrier && matchesType && matchesMonth;
        });
    }, [sales, searchTerm, filterCarrier, filterType, filterMonth]);

    return (
        <div className="history-container">
            <div className="filter-bar glass">
                <div className="filter-group search-group">
                    <Search size={18} className="filter-icon" />
                    <input
                        type="text"
                        placeholder="이름, 전화번호, 모델명 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <Filter size={18} className="filter-icon" />
                    <select value={filterCarrier} onChange={(e) => setFilterCarrier(e.target.value)}>
                        <option value="ALL">통신사 전체</option>
                        {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="ALL">유형 전체</option>
                        {Object.entries(ACTIVATION_TYPE_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <input
                        type="month"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="month-input"
                    />
                    {filterMonth && (
                        <button className="btn-clear" onClick={() => setFilterMonth('')}>전체</button>
                    )}
                </div>
            </div>

            <div className="table-container glass mt-4">
                <div className="table-header">
                    <h3>검색 내역 ({filteredSales.length}건)</h3>
                </div>
                <div className="table-wrapper">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th className="hide-mobile">날짜</th>
                                <th>통신사</th>
                                <th className="hide-mobile">유형</th>
                                <th className="hide-mobile">요금제</th>
                                <th>가입자</th>
                                <th className="hide-mobile">연락처</th>
                                <th className="hide-mobile">모델명</th>
                                <th>실수입</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.length > 0 ? (
                                filteredSales.map((sale, idx) => {
                                    const netIncome = calculateNetIncome(sale.items);
                                    const carrier = carriers.find(c => c.id === sale.carrierId);

                                    return (
                                        <tr key={sale.id}>
                                            <td>{filteredSales.length - idx}</td>
                                            <td className="hide-mobile">{sale.saleDate}</td>
                                            <td><span className={`badge ${sale.carrierId.toLowerCase()}`}>
                                                {carrier?.name || '기타'}
                                            </span></td>
                                            <td className="hide-mobile">{ACTIVATION_TYPE_LABELS[sale.activationType] || sale.activationType}</td>
                                            <td className="hide-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{sale.planName || '-'}</td>
                                            <td>{sale.subscriberName}</td>
                                            <td className="hide-mobile">{sale.phoneNumber}</td>
                                            <td className="hide-mobile">{sale.modelName || '-'}</td>
                                            <td className="text-primary" style={{ fontWeight: 700 }}>{formatCurrency(netIncome)}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <button className="btn-icon" onClick={() => onEdit(sale)} style={{ color: 'var(--text-primary)' }}>
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="btn-icon delete" onClick={() => onDelete(sale.id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                        조건에 일치하는 내역이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default History;
