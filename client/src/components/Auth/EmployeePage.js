import useUser from '../../hooks/useUser';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Loading from '../UI/Loading';

function EmployeePage({ children }) {
    const auth = useUser();
    const router = useRouter();

    if (!auth.loading && auth.loggedIn && auth.user.isAdmin) {
        router.push('/');
        return <Loading />;
    }

    if (auth.loading || !auth.loggedIn) {
        return <Loading />;
    }

    return React.cloneElement(children, { auth });
}

export default EmployeePage;
