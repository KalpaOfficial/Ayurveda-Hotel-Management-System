import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import SuccessPage from '../components/SuccessPage';
import { api } from '../api';

export default function SuccessWrapper() {
  const { search } = useLocation();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(search);
    const session_id = params.get('session_id');
    const t = params.get('t'); // token

    if (session_id && t) {
      (async () => {
        try {
          setLoading(true);
          const { data } = await api.get(`/api/payments/confirm?session_id=${session_id}&t=${t}`);
          if (data.status !== 'Paid') {
            setError('Payment is still pending. Please wait a moment and refresh.');
          } else {
            setTx(data); // <-- includes booking
            localStorage.setItem('lastTransaction', JSON.stringify(data));
          }
        } catch (e) {
          setError('Could not verify payment. Please contact support.');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      const last = localStorage.getItem('lastTransaction');
      if (last) setTx(JSON.parse(last));
      setLoading(false);
    }
  }, [search]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600">{error}</p>
        <Link to="/pay" className="mt-4 text-blue-600">Go back to Payment Page</Link>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>No transaction found.</p>
        <Link to="/pay" className="mt-4 text-blue-600">Go back to Payment Page</Link>
      </div>
    );
  }

  return <SuccessPage transaction={tx} />;
}