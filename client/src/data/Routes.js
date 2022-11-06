let apiBasePath = `http://localhost:8000/api`;

//#region Auth
const authKey = 'authentication';
const apiAuthRoute = `${apiBasePath}/${authKey}`;
export const apiAuthRoutes = {
  register: `${apiAuthRoute}/register`,
  validateRegister: `${apiAuthRoute}/validate-register`,
  login: `${apiAuthRoute}/login`,
  validateLogin: `${apiAuthRoute}/validate-login`,
  forgotPassword: `${apiAuthRoute}/forgot-password`,
  resetPassword: `${apiAuthRoute}/reset-password`,
  logout: `${apiAuthRoute}/logout`,
  getUser: `${apiAuthRoute}/user`,
  resendOtp: `${apiAuthRoute}/resend-otp`
};
