import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: 'ADMIN' | 'MANAGER' | 'SELLER' | null;
    storeId: string | null;
    sellerId: string | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'SELLER' | null>(null);
    const [storeId, setStoreId] = useState<string | null>(null);
    const [sellerId, setSellerId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setRole(null);
                setStoreId(null);
                setSellerId(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('sellers')
            .select('id, store_id, role')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            // If they have no mapped seller record yet
            setRole(null);
            setStoreId(null);
            setSellerId(null);
        } else if (data) {
            setRole(data.role);
            setStoreId(data.store_id);
            setSellerId(data.id);
        }
        setIsLoading(false);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, role, storeId, sellerId, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
