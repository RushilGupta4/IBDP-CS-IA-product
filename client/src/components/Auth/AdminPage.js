import useUser from '../../hooks/useUser';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Loading from '../UI/Loading';

function AdminPage({ children }) {
  const auth = useUser();
  const router = useRouter();

  if (!auth.loading && !(auth.loggedIn && !auth.isAdmin)) {
    router.push('/');
    return <Loading />;
  }

  if (auth.loading || !auth.loggedIn) {
    return <Loading />;
  }

  return React.cloneElement(children, { auth });
}

export default AdminPage;
