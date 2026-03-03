import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package } from 'lucide-react';
import './Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let loginEmail = email;
        // Allows typing just "syabgy" and maps it to "syabgy@hani.com" internally
        if (!email.includes('@')) {
            loginEmail = `${email}@hani.com`;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password,
        });

        if (error) {
            setError('로그인 실패: 아이디 또는 비밀번호를 확인해주세요.');
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card glass">
                <div className="login-header">
                    <div className="logo-box">
                        <Package className="logo-icon" />
                    </div>
                    <h2>Hani SaaS</h2>
                    <p>판매 관리 시스템에 로그인하세요</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    {error && <div className="login-error">{error}</div>}

                    <div className="form-group">
                        <label>아이디</label>
                        <input
                            type="text"
                            placeholder="아이디를 입력하세요"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>비밀번호</label>
                        <input
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
