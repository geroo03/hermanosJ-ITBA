import { useEffect, useState } from 'react';
import { getProductById } from '../services/productsApi';

export default function useProduct(id) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ product: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    setState({ product: null, loading: true, error: null });

    getProductById(id).then(
      (product) => {
        if (active) setState({ product, loading: false, error: null });
      },
      (error) => {
        if (active) setState({ product: null, loading: false, error });
      },
    );

    return () => { active = false; };
  }, [id, attempt]);

  return { ...state, retry: () => setAttempt((current) => current + 1) };
}
