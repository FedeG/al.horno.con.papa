import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HashRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/')) {
      const newPath = hash.slice(1);
      navigate(newPath, { replace: true });
    }
  }, [navigate]);

  return null;
}

export default HashRedirect;
