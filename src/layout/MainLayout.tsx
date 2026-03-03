import React from 'react';
import { LayoutDashboard, FileSpreadsheet, BarChart3, Settings, LogOut, Package, List } from 'lucide-react';
import './MainLayout.css';

interface MainLayoutProps {
    children: React.ReactNode;
    activeTab: 'sales' | 'closing' | 'reports' | 'history';
    onTabChange: (tab: 'sales' | 'closing' | 'reports' | 'history') => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, onTabChange }) => {
    const pageTitles = {
        sales: { title: '대시보드', sub: '최근 내역 및 요약' },
        closing: { title: '일일 결산 마감', sub: '일계표 정산' },
        reports: { title: '통계 리포트', sub: '리포트 분석' },
        history: { title: '접수 내역', sub: '전체 목록 필터검색' }
    };

    return (
        <div className="layout-root">
            {/* Desktop Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-box">
                        <Package className="logo-icon" />
                    </div>
                    <span className="brand-name">Hani SaaS</span>
                </div>

                <nav className="nav-menu">
                    <button
                        className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`}
                        onClick={() => onTabChange('sales')}
                    >
                        <LayoutDashboard className="nav-icon" />
                        <span>대시보드</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => onTabChange('history')}
                    >
                        <List className="nav-icon" />
                        <span>접수 내역</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'closing' ? 'active' : ''}`}
                        onClick={() => onTabChange('closing')}
                    >
                        <FileSpreadsheet className="nav-icon" />
                        <span>일일 결산</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => onTabChange('reports')}
                    >
                        <BarChart3 className="nav-icon" />
                        <span>통계 리포트</span>
                    </button>
                    <div className="nav-divider"></div>
                    <button className="nav-item secondary">
                        <Settings className="nav-icon" />
                        <span>설정</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="avatar">AD</div>
                        <div className="user-info">
                            <span className="user-name">관리자</span>
                            <span className="user-role">대표</span>
                        </div>
                    </div>
                    <button className="btn-logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-bottom-nav">
                <button
                    className={`mobile-nav-item ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => onTabChange('sales')}
                >
                    <LayoutDashboard className="nav-icon" />
                    <span>대시보드</span>
                </button>
                <button
                    className={`mobile-nav-item ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => onTabChange('history')}
                >
                    <List className="nav-icon" />
                    <span>내역</span>
                </button>
                <button
                    className={`mobile-nav-item ${activeTab === 'closing' ? 'active' : ''}`}
                    onClick={() => onTabChange('closing')}
                >
                    <FileSpreadsheet className="nav-icon" />
                    <span>결산</span>
                </button>
                <button
                    className={`mobile-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => onTabChange('reports')}
                >
                    <BarChart3 className="nav-icon" />
                    <span>통계</span>
                </button>
                <button className="mobile-nav-item">
                    <Settings className="nav-icon" />
                    <span>설정</span>
                </button>
            </nav>

            <main className="main-content">
                <header className="content-header">
                    <div className="header-left">
                        <h2>{pageTitles[activeTab].title}</h2>
                        <p className="breadcrumb">대시보드 / {pageTitles[activeTab].sub}</p>
                    </div>
                    <div className="header-right">
                        <div className="date-picker-mock">
                            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                        </div>
                    </div>
                </header>
                <section className="page-body">
                    {children}
                </section>
            </main>
        </div>
    );
};

export default MainLayout;
