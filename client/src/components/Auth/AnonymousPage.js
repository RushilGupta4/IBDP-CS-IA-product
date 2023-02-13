import { useRouter } from 'next/router';
import React from 'react';
import Loading from '../UI/Loading';
import useUser from '../../hooks/useUser';

function AnonymousPage ( { children } )
{
  const { loading, loggedIn } = useUser();
  const router = useRouter();

  if ( loggedIn )
  {
    router.replace( '/' );
    return <Loading />;
  }

  if ( loading || loggedIn )
  {
    return <Loading />;
  }

  return children;
}

export default AnonymousPage;
