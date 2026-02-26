import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { SettlementType, Carrier, Sale, ActivationType } from '../types';
import { formatCurrency, SETTLEMENT_LABELS, calculateNetIncome, ACTIVATION_TYPE_LABELS } from '../lib/utils';
import './SaleForm.css';

interface SaleFormProps {
    onClose: () => void;
    onSubmit: (sale: Omit<Sale, 'id'>) => void;
    carriers: Carrier[];
}

const SaleForm: React.FC<SaleFormProps> = ({ onClose, onSubmit, carriers }) => {
    const [formData, setFormData] = useState({
        saleDate: new Date().toISOString().split('T')[0],
        carrierId: carriers[0]?.id || '',
        activationType: 'NEW' as ActivationType,
        planName: '',
        subscriberName: '',
        birthDate: '',
        planChangeDate: '',
        phoneNumber: '',
        modelName: '',
        serialNumber: '',
        memo: '',
    });

    const [settlements, setSettlements] = useState<Array<{ type: SettlementType; amount: number; note: string }>>([
        { type: 'SALE_AMOUNT', amount: 0, note: '' },
        { type: 'SUBSIDY', amount: 0, note: '' },
        { type: 'REBATE', amount: 0, note: '' },
        { type: 'EXTRA', amount: 0, note: '' },
        { type: 'INSTALLMENT', amount: 0, note: '' },
    ]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSettlementChange = (index: number, field: string, value: string | number) => {
        const newSettlements = [...settlements];
        newSettlements[index] = { ...newSettlements[index], [field]: value };
        setSettlements(newSettlements);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subscriberName) {
            alert('가입자명을 입력해주세요.');
            return;
        }

        const newSale: Omit<Sale, 'id'> = {
            ...formData,
            storeId: 'default-store',
            sellerId: 'default-seller',
            status: 'OPEN',
            items: settlements.map(s => ({
                ...s,
                id: crypto.randomUUID(),
                saleId: '',
                amount: Number(s.amount)
            }))
        };

        onSubmit(newSale);
        onClose();
    };

    const netIncome = calculateNetIncome(settlements as any);

    return (
        <div className="modal-overlay">
            <div className="modal-content glass">
                <header className="modal-header">
                    <h2>신규 판매 등록</h2>
                    <button className="btn-close" onClick={onClose}><X size={20} /></button>
                </header>

                <form className="sale-form-grid" onSubmit={handleSubmit}>
                    <section className="form-section">
                        <h3>기본 정보</h3>
                        <div className="input-group">
                            <label>판매일자</label>
                            <input type="date" name="saleDate" value={formData.saleDate} onChange={handleInputChange} />
                        </div>
                        <div className="input-row">
                            <div className="input-group">
                                <label>통신사</label>
                                <select name="carrierId" value={formData.carrierId} onChange={handleInputChange}>
                                    {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>개통유형</label>
                                <select name="activationType" value={formData.activationType} onChange={handleInputChange}>
                                    {Object.entries(ACTIVATION_TYPE_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="input-group">
                            <label>요금제</label>
                            <input type="text" name="planName" placeholder="예: 5G 올인원 95" value={formData.planName} onChange={handleInputChange} />
                        </div>
                        <div className="input-row">
                            <div className="input-group">
                                <label>가입자명</label>
                                <input type="text" name="subscriberName" placeholder="성함 입력" value={formData.subscriberName} onChange={handleInputChange} required />
                            </div>
                            <div className="input-group">
                                <label>생년월일</label>
                                <input type="text" name="birthDate" placeholder="YYMMDD" value={formData.birthDate} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="input-row">
                            <div className="input-group">
                                <label>휴대폰번호</label>
                                <input type="text" name="phoneNumber" placeholder="010-0000-0000" value={formData.phoneNumber} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label>요금제변경/부가삭제일</label>
                                <input type="date" name="planChangeDate" value={formData.planChangeDate} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="input-row">
                            <div className="input-group">
                                <label>모델명</label>
                                <input type="text" name="modelName" placeholder="예: iPhone 15 Pro" value={formData.modelName} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label>일련번호</label>
                                <input type="text" name="serialNumber" placeholder="IMEI/시리얼" value={formData.serialNumber} onChange={handleInputChange} />
                            </div>
                        </div>
                    </section>

                    <section className="form-section highlight">
                        <div className="section-header">
                            <h3>정산(Settlement) 정보</h3>
                            <div className="net-income-box">
                                <span className="label">실수입 합계</span>
                                <span className={`value ${netIncome >= 0 ? 'positive' : 'negative'}`}>
                                    {formatCurrency(netIncome)}
                                </span>
                            </div>
                        </div>

                        <div className="settlement-list">
                            {settlements.map((s, idx) => (
                                <div key={s.type} className="settlement-item">
                                    <span className="type-label">{SETTLEMENT_LABELS[s.type]}</span>
                                    <input
                                        type="number"
                                        value={s.amount}
                                        onChange={(e) => handleSettlementChange(idx, 'amount', e.target.value)}
                                        placeholder="amount"
                                    />
                                    <input
                                        type="text"
                                        value={s.note}
                                        onChange={(e) => handleSettlementChange(idx, 'note', e.target.value)}
                                        placeholder="비고"
                                        className="note-input"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="form-section full-width">
                        <label>비고</label>
                        <textarea name="memo" rows={3} value={formData.memo} onChange={handleInputChange}></textarea>
                    </section>

                    <footer className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>취소</button>
                        <button type="submit" className="btn-save">
                            <Save size={18} />
                            <span>판매 저장</span>
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default SaleForm;
