import { useRouter } from 'next/router';
import React from 'react';
import useUser from '../../hooks/useUser';
import Loading from '../../components/UI/Loading';

function AdminPage ( { children } )
{
  const auth = useUser();
  const router = useRouter();

  if ( !auth.loading && !auth.loggedIn )
  {
    router.push( '/' );
    return <Loading />;
  }

  if ( auth.loading || !auth.loggedIn )
  {
    return <Loading />;
  }

  return React.cloneElement( children, { auth } );
}

export default AdminPage;
