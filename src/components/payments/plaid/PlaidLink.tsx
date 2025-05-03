import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { apiPost } from '@/providers/apiRequest';

export default function PlaidLink() {
  const [token, setToken] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const createLinkToken = async () => {
    const response = await apiPost('/api/create-link-token', {
        method: 'POST',
      });
      const { link_token } = await response.json();
      setToken(link_token);
    };
    createLinkToken();
  }, []);

  const onSuccess = useCallback(async (publicToken) => {
    const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
    await apiPost(`${backendURL}/api/exchange-public-token`, {
      public_token: publicToken,
    });
    router.push('/dashboard');
  }, []);

  const { open, ready } = usePlaidLink({
    token,
    onSuccess,
  });

  return (
    <button onClick={() => open()} disabled={!ready}>
      <strong>Link account</strong>
    </button>
  );
}