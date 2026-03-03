import React, { useState } from 'react';
import { X, Save, Edit2, Plus } from 'lucide-react';
import { SettlementType, Carrier, Sale, ActivationType } from '../types';
import { formatCurrency, SETTLEMENT_LABELS, calculateNetIncome, ACTIVATION_TYPE_LABELS } from '../lib/utils';
import { supabase } from '../lib/supabase';
import './SaleForm.css';

interface SaleFormProps {
    initialData?: Sale;
    onClose: () => void;
    onSubmit: (sale: Omit<Sale, 'id'> | Sale) => void;
    carriers: Carrier[];
    onCarrierAdded?: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ initialData, onClose, onSubmit, carriers, onCarrierAdded }) => {
    const [formData, setFormData] = useState({
        saleDate: initialData?.saleDate || new Date().toISOString().split('T')[0],
        carrierId: initialData?.carrierId || carriers[0]?.id || '',
        activationType: initialData?.activationType || ('NEW' as ActivationType),
        planName: initialData?.planName || '',
        subscriberName: initialData?.subscriberName || '',
        birthDate: initialData?.birthDate || '',
        planChangeDate: initialData?.planChangeDate || '',
        additionalServiceChangeDate: initialData?.additionalServiceChangeDate || '',
        phoneNumber: initialData?.phoneNumber || '',
        modelName: initialData?.modelName || '',
        serialNumber: initialData?.serialNumber || '',
        memo: initialData?.memo || '',
    });

    const [settlements, setSettlements] = useState<Array<{ type: SettlementType; amount: number; note: string }>>(
        initialData?.items.map(item => ({ type: item.type, amount: item.amount, note: item.note || '' })) || [
            { type: 'SALE_AMOUNT', amount: 0, note: '' },
            { type: 'SUBSIDY', amount: 0, note: '' },
            { type: 'REBATE', amount: 0, note: '' },
            { type: 'EXTRA', amount: 0, note: '' },
            { type: 'INSTALLMENT', amount: 0, note: '' },
        ]);

    const [isAddingCarrier, setIsAddingCarrier] = useState(false);
    const [newCarrierName, setNewCarrierName] = useState('');

    const handleAddCarrier = async () => {
        if (!newCarrierName.trim()) return;

        const { data, error } = await supabase
            .from('carriers')
            .insert([{ name: newCarrierName.trim() }])
            .select()
            .single();

        if (error) {
            alert('통신사 추가 중 오류가 발생했습니다.');
            console.error(error);
            return;
        }

        if (onCarrierAdded) {
            onCarrierAdded();
        }

        setFormData(prev => ({ ...prev, carrierId: data.id }));
        setIsAddingCarrier(false);
        setNewCarrierName('');
    };

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

        if (initialData) {
            const updatedSale: Sale = {
                ...initialData,
                ...formData,
                items: settlements.map(s => {
                    const existingItem = initialData.items.find(i => i.type === s.type);
                    return {
                        ...s,
                        id: existingItem?.id || crypto.randomUUID(),
                        saleId: initialData.id,
                        amount: Number(s.amount)
                    };
                })
            };
            onSubmit(updatedSale);
        } else {
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
        }
        onClose();
    };

    const handleApplyDatePreset = (field: 'planChangeDate' | 'additionalServiceChangeDate', offset: number | 'M+3') => {
        if (!formData.saleDate) return;
        const baseDate = new Date(formData.saleDate);

        if (offset === 'M+3') {
            baseDate.setDate(1);
            baseDate.setMonth(baseDate.getMonth() + 3);
        } else {
            baseDate.setDate(baseDate.getDate() + offset);
        }

        const yyyy = baseDate.getFullYear();
        const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
        const dd = String(baseDate.getDate()).padStart(2, '0');

        setFormData(prev => ({
            ...prev,
            [field]: `${yyyy}-${mm}-${dd}`
        }));
    };

    const netIncome = calculateNetIncome(settlements as any);

    return (
        <div className="modal-overlay">
            <div className="modal-content glass">
                <header className="modal-header">
                    <h2>{initialData ? '판매 내역 수정' : '신규 판매 등록'}</h2>
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
                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>통신사</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingCarrier(!isAddingCarrier)}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}
                                    >
                                        {isAddingCarrier ? '취소' : <><Plus size={14} /> 직접 추가</>}
                                    </button>
                                </label>
                                {isAddingCarrier ? (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={newCarrierName}
                                            onChange={(e) => setNewCarrierName(e.target.value)}
                                            placeholder="새 통신사명 입력"
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCarrier}
                                            className="btn-primary"
                                            style={{ padding: '0 1rem', borderRadius: '8px' }}
                                        >
                                            저장
                                        </button>
                                    </div>
                                ) : (
                                    <select name="carrierId" value={formData.carrierId} onChange={handleInputChange}>
                                        {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                )}
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
                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <span>요금제 변경일</span>
                                    <div className="preset-buttons">
                                        <button type="button" className="btn-preset" onClick={() => handleApplyDatePreset('planChangeDate', 121)}>+121일</button>
                                        <button type="button" className="btn-preset" onClick={() => handleApplyDatePreset('planChangeDate', 191)}>+191일</button>
                                    </div>
                                </label>
                                <input type="date" name="planChangeDate" value={formData.planChangeDate} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="input-row">
                            <div className="input-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <span>부가서비스 변경일</span>
                                    <div className="preset-buttons">
                                        <button type="button" className="btn-preset" onClick={() => handleApplyDatePreset('additionalServiceChangeDate', 94)}>+94일</button>
                                        <button type="button" className="btn-preset" onClick={() => handleApplyDatePreset('additionalServiceChangeDate', 121)}>+121일</button>
                                        <button type="button" className="btn-preset" onClick={() => handleApplyDatePreset('additionalServiceChangeDate', 'M+3')}>M+3</button>
                                    </div>
                                </label>
                                <input type="date" name="additionalServiceChangeDate" value={formData.additionalServiceChangeDate} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label>모델명</label>
                                <input type="text" name="modelName" placeholder="예: iPhone 15 Pro" value={formData.modelName} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="input-row">
                            <div className="input-group">
                                <label>일련번호</label>
                                <input type="text" name="serialNumber" placeholder="IMEI/시리얼" value={formData.serialNumber} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
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
                            {initialData ? <Edit2 size={18} /> : <Save size={18} />}
                            <span>{initialData ? '수정 완료' : '판매 저장'}</span>
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default SaleForm;
