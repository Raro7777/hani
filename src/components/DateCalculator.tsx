import React, { useState, useEffect, useRef } from 'react';
import { Calendar, X, ChevronRight, Calculator } from 'lucide-react';
import './DateCalculator.css';

const DateCalculator: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [baseDate, setBaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [offsetDays, setOffsetDays] = useState<number>(0);
    const [resultDate, setResultDate] = useState('');

    // For draggability (simple implementation)
    const [position, setPosition] = useState({ x: 20, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<{ startX: number, startY: number, startPosX: number, startPosY: number } | null>(null);

    useEffect(() => {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + (Number(offsetDays) || 0));

        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        };
        setResultDate(date.toLocaleDateString('ko-KR', options));
    }, [baseDate, offsetDays]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.calc-header')) {
            setIsDragging(true);
            dragRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                startPosX: position.x,
                startPosY: position.y
            };
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && dragRef.current) {
                const dx = e.clientX - dragRef.current.startX;
                const dy = e.clientY - dragRef.current.startY;
                setPosition({
                    x: dragRef.current.startPosX + dx,
                    y: dragRef.current.startPosY + dy
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    if (!isOpen) {
        return (
            <button
                className="calc-toggle-btn glass"
                onClick={() => setIsOpen(true)}
                title="날짜 계산기"
                style={{ left: position.x, top: position.y }}
            >
                <Calculator size={24} />
            </button>
        );
    }

    return (
        <div
            className="date-calculator glass draggable"
            onMouseDown={handleMouseDown}
            style={{ left: position.x, top: position.y }}
        >
            <header className="calc-header">
                <div className="header-title">
                    <Calendar size={16} />
                    <span>날짜 계산기</span>
                </div>
                <button className="btn-close-small" onClick={() => setIsOpen(false)}>
                    <X size={16} />
                </button>
            </header>

            <div className="calc-body">
                <div className="input-group">
                    <label>기준 날짜</label>
                    <input
                        type="date"
                        value={baseDate}
                        onChange={(e) => setBaseDate(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label>더할 일수</label>
                    <div className="offset-input-wrapper">
                        <input
                            type="number"
                            value={offsetDays}
                            onChange={(e) => setOffsetDays(Number(e.target.value))}
                            placeholder="예: 90"
                        />
                        <span className="unit">일</span>
                    </div>
                </div>

                <div className="quick-buttons">
                    <button onClick={() => setOffsetDays(90)}>+90일</button>
                    <button onClick={() => setOffsetDays(180)}>+180일</button>
                    <button onClick={() => setOffsetDays(365)}>+1년</button>
                </div>

                <div className="result-area">
                    <ChevronRight size={18} className="text-secondary" />
                    <div className="result-content">
                        <span className="result-label">계산된 날짜</span>
                        <span className="result-value">{resultDate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DateCalculator;
