import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');
    if (!userId || !token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }
    authApi.verifyEmail(userId, token)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      });
  }, [searchParams]);

  return (
    <div className="text-center">
      {status === 'loading' && <LoadingSpinner size="lg" />}
      {status === 'success' && (
        <>
          <div className="text-6xl mb-4">&#10003;</div>
          <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
          <p className="text-text-light mb-4">{message}</p>
          <Link to="/login" className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition no-underline">
            Go to Login
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="text-6xl mb-4 text-danger">&#10007;</div>
          <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
          <p className="text-text-light mb-4">{message}</p>
          <Link to="/login" className="text-primary hover:underline no-underline font-medium">Back to Login</Link>
        </>
      )}
    </div>
  );
}
