import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import authService from '../services/authService';
import { useAuthStore } from '../store/authStore';

type State = 'verifying' | 'success' | 'error';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<State>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const hasRun = useRef(false);  // guard against React Strict Mode double-invoke

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setState('error');
      setErrorMsg('No verification token found in the URL.');
      return;
    }

    authService.verifyEmail(token)
      .then(() => {
        setState('success');
        // Sync the persisted user object so the unverified banner disappears immediately
        const { user, updateUser } = useAuthStore.getState();
        if (user) updateUser({ ...user, is_verified: true });
      })
      .catch((err: any) => {
        const detail = err?.response?.data?.detail;
        setState('error');
        setErrorMsg(
          typeof detail === 'string'
            ? detail
            : 'Verification failed. The link may have expired.',
        );
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 max-w-md w-full text-center">

        {state === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Verifying your email…</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Just a moment.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Email verified!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
              Your account is now active. You can log in and start using Netra.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Go to Login
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Verification failed</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-2">{errorMsg}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              Need a new link?{' '}
              <Link to="/login" className="text-primary-600 hover:underline">
                Sign in
              </Link>{' '}
              and request a new verification email from your account.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <Mail className="w-4 h-4" />
              <span>Links expire after 24 hours</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
