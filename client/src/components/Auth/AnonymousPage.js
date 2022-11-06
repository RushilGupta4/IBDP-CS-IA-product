import useUser from '../../hooks/useUser';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Loading from '../UI/Loading';

function AnonymousPage({ children }) {
  const { loading, loggedIn } = useUser();
  const router = useRouter();

  if (loggedIn) {
    router.replace('/');
    return <Loading />;
  }

  if (loading || loggedIn) {
    return <Loading />;
  }

  return children;
}

export default AnonymousPage;
