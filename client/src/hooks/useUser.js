import useSWR from 'swr';

import { getUser } from '../utils/userApi';
import { apiAuthRoutes } from '../data/Routes';

const useUser = () => {
  const { data, mutate, error } = useSWR(apiAuthRoutes.getUser, getUser, {
    refreshInterval: 300000, // 5 Minutes
    shouldRetryOnError: false,
  });

  const loading = !data && !error;
  const loggedIn = Boolean(!error && data);

  return {
    loading,
    loggedIn,
    user: data,
    mutate,
  };
};

export default useUser;
