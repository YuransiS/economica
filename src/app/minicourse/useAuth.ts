'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MinicourseUser, MinicourseProgress } from './types';
import { getProfile, getProgress } from './supabase';

export function useAuth(requireAdmin = false) {
  const [user, setUser] = useState<MinicourseUser | null>(null);
  const [progress, setProgress] = useState<MinicourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshState = async (userId: string) => {
    try {
      const u = await getProfile(userId);
      const p = await getProgress(userId);
      if (u) {
        setUser(u);
        // Save back updated user to session
        localStorage.setItem('minicourse_session', JSON.stringify(u));
      }
      if (p) {
        setProgress(p);
      }
    } catch (err) {
      console.error("Error refreshing minicourse auth state:", err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const sessionStr = localStorage.getItem('minicourse_session');
      
      const isAdminRoute = pathname.startsWith('/minicourse/admin');
      const isLoginRoute = pathname === '/minicourse/login' || pathname === '/minicourse/admin/login';

      if (!sessionStr) {
        // If not on login page, redirect to correct login page
        if (!isLoginRoute) {
          if (isAdminRoute) {
            router.push('/minicourse/admin/login');
          } else {
            router.push('/minicourse/login');
          }
        } else {
          setLoading(false);
        }
        return;
      }

      try {
        const sessionUser = JSON.parse(sessionStr) as MinicourseUser;
        
        // Admin authorization check
        if (requireAdmin && sessionUser.role !== 'admin') {
          router.push('/minicourse');
          return;
        }

        // Fetch fresh profile and progress from Database/LocalStorage
        const freshUser = await getProfile(sessionUser.id);
        const freshProgress = await getProgress(sessionUser.id);

        if (!freshUser) {
          // Session stale or deleted
          localStorage.removeItem('minicourse_session');
          if (isAdminRoute) {
            router.push('/minicourse/admin/login');
          } else {
            router.push('/minicourse/login');
          }
          return;
        }

        // Student access verification
        if (freshUser.role === 'student') {
          if (!freshUser.is_paid) {
            localStorage.removeItem('minicourse_session');
            router.push('/?warning=unpaid');
            return;
          }
          if (freshUser.status === 'under_investigation') {
            localStorage.removeItem('minicourse_session');
            router.push('/?warning=blocked');
            return;
          }
        }

        setUser(freshUser);
        if (freshProgress) {
          setProgress(freshProgress);
        }

        // If logged in user is trying to access login page, redirect to dashboard
        if (isLoginRoute) {
          if (freshUser.role === 'admin') {
            router.push('/minicourse/admin');
          } else {
            router.push('/minicourse');
          }
        }
      } catch (err) {
        console.error("Failed to parse minicourse session:", err);
        localStorage.removeItem('minicourse_session');
        if (isAdminRoute) {
          router.push('/minicourse/admin/login');
        } else {
          router.push('/minicourse/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, requireAdmin]);

  const login = (userData: MinicourseUser, userProgress?: MinicourseProgress) => {
    localStorage.setItem('minicourse_session', JSON.stringify(userData));
    setUser(userData);
    if (userProgress) {
      setProgress(userProgress);
    }
    if (userData.role === 'admin') {
      router.push('/minicourse/admin');
    } else {
      router.push('/minicourse');
    }
  };

  const logout = () => {
    localStorage.removeItem('minicourse_session');
    setUser(null);
    setProgress(null);
    if (pathname.startsWith('/minicourse/admin')) {
      router.push('/minicourse/admin/login');
    } else {
      router.push('/minicourse/login');
    }
  };

  return {
    user,
    progress,
    loading,
    login,
    logout,
    refreshProgress: () => user && refreshState(user.id)
  };
}
