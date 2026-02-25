import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { Sale } from '../types';
import { calculateNetIncome, formatCurrency } from '../lib/utils';
import './Analytics.css';

interface AnalyticsProps {
    sales: Sale[];
}

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];
const CARRIER_COLORS: Record<string, string> = {
    skt: '#f87171',
    kt: '#60a5fa',
    lg: '#f472b6',
};

const Analytics: React.FC<AnalyticsProps> = ({ sales }) => {
    // 1. Weekly Trend Data
    const weeklyTrendData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        return last7Days.map(date => {
            const daySales = sales.filter(s => s.saleDate === date);
            const totalIncome = daySales.reduce((acc, s) => acc + calculateNetIncome(s.items), 0);
            return {
                name: date.slice(5), // MM-DD
                income: totalIncome
            };
        });
    }, [sales]);

    // 2. Carrier Distribution
    const carrierData = useMemo(() => {
        const counts: Record<string, number> = {};
        sales.forEach(s => {
            counts[s.carrierId] = (counts[s.carrierId] || 0) + 1;
        });
        return Object.entries(counts).map(([id, value]) => ({
            name: id.toUpperCase(),
            value
        }));
    }, [sales]);

    // 3. Performance Summary
    const stats = useMemo(() => {
        const total = sales.reduce((acc, s) => acc + calculateNetIncome(s.items), 0);
        const avg = sales.length > 0 ? total / sales.length : 0;
        return { total, avg, count: sales.length };
    }, [sales]);

    // 4. Settlement Type Breakdown
    const settlementData = useMemo(() => {
        const sums: Record<string, number> = {};
        sales.forEach(s => {
            s.items.forEach(item => {
                const label = item.type;
                sums[label] = (sums[label] || 0) + Math.abs(item.amount);
            });
        });
        return Object.entries(sums).map(([name, value]) => ({
            name: name === 'SALE_AMOUNT' ? '매출' : name === 'REBATE' ? 'R' : name === 'SUBSIDY' ? '보조금' : '기타',
            value
        }));
    }, [sales]);

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h2>실적 통계 리포트</h2>
                <p>최근 판매 데이터를 기반으로 분석한 실적 현황입니다.</p>
            </div>

            <div className="analytics-grid">
                {/* Trend Chart */}
                <div className="chart-card glass full-width">
                    <div className="chart-header">
                        <h3>최근 7일 수익 추이</h3>
                        <span className="badge-premium">Live</span>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={weeklyTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 10000}만`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    formatter={(value: any) => [formatCurrency(value), '실수입']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Carrier Pie Chart */}
                <div className="chart-card glass">
                    <div className="chart-header">
                        <h3>통신사 점유율</h3>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={carrierData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {carrierData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CARRIER_COLORS[entry.name.toLowerCase()] || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Settlement Bar Chart */}
                <div className="chart-card glass">
                    <div className="chart-header">
                        <h3>정산 항목별 분포 (절대값)</h3>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={settlementData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    formatter={(value: any) => [formatCurrency(value), '합계']}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="chart-card glass full-width">
                    <div className="chart-header">
                        <h3>주요 지표 요약</h3>
                    </div>
                    <div className="metrics-list">
                        <div className="metric-item">
                            <span className="m-label">누적 총 수익</span>
                            <span className="m-value">{formatCurrency(stats.total)}</span>
                        </div>
                        <div className="metric-item">
                            <span className="m-label">건당 평균 수익</span>
                            <span className="m-value">{formatCurrency(stats.avg)}</span>
                        </div>
                        <div className="metric-item">
                            <span className="m-label">전체 판매 건수</span>
                            <span className="m-value">{stats.count}건</span>
                        </div>
                    </div>
                    <div className="metric-footer">
                        <p>* 실물 현금 정산 기준 데이터입니다.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
