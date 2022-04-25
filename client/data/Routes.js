const domain = 'localhost:8000';

//#region Api
const apiBasePath = `https://${domain}/api`;

const authKey = 'auth';
const apiAuthRoute = `${apiBasePath}/${authKey}`;
export const apiAuthRoutes = {
  register: `${apiAuthRoute}/register`,
  validateRegister: `${apiAuthRoute}/validate-register`,
  login: `${apiAuthRoute}/login`,
  validateLogin: `${apiAuthRoute}/validate-login`,
  logout: `${apiAuthRoute}/logout`,
  getUser: `${apiAuthRoute}/user`,
  resendOtp: `${apiAuthRoute}/resend-otp`
};
