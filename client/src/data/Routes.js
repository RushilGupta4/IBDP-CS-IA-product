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


const accountsKey = 'accounts';
const apiAccountRoute = `${apiBasePath}/${accountsKey}`;
export const apiAccountRoutes = {
  seeHallOfFame: `${apiAccountRoute}/see-hall-of-fame`,
  updateHallOfFame : `${apiAccountRoute}/update-hall-of-fame`,
  employees : `${apiAccountRoute}/employees`,
  seeAttendance : `${apiAccountRoute}/see-attendance`,
  markAttendance : `${apiAccountRoute}/mark-attendance`,
  leaveApplication: `${apiAccountRoute}/leave-application`,
  seeLeaveApplication: `${apiAccountRoute}/see-leave-application`,
};