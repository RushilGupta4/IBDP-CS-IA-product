import axios from 'axios';
import { apiAuthRoutes } from '../data/Routes';

axios.defaults.withCredentials = true;

export const getUser = async () => {
  const resp = await axios.get(apiAuthRoutes.getUser);
  return resp.data;
};

export const login = async ({ email, password, medium }) => {
  return await axios.post(apiAuthRoutes.login, {
    email,
    password,
    medium,
  });
};

export const validateLogin = async ({ otp }) => {
  return await axios.post(apiAuthRoutes.validateLogin, { otp });
};

export const register = async ({ email }) => {
  return await axios.post(apiAuthRoutes.register, { email });
};

export const validateRegister = async ({
  token,
  firstName,
  lastName,
  password,
  rePassword,
}) => {
  return await axios.post(apiAuthRoutes.validateRegister, {
      token,
      firstName,
      lastName,
      password,
      rePassword,
  });
};

export const forgotPassword = async ({ email }) => {
  return await axios.post(apiAuthRoutes.forgotPassword, { email });
};

export const resetPassword = async ({ token, id, password, rePassword }) => {
  return await axios.post(apiAuthRoutes.resetPassword, {
    token,
    id,
    password,
    rePassword,
  });
};

export const logout = async () => {
  await axios.post(apiAuthRoutes.logout);
};
