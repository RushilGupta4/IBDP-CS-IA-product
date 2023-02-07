import Link from 'next/link';
import { useState } from 'react';
import {
    login as loginUser,
    validateLogin as validateUserLogin,
} from '../utils/userApi';
import Loading from '../components/UI/Loading';
import useAxiosData from '../hooks/useAxiosData';
import useUser from '../hooks/useUser';
import { TextInput, PasswordInput } from '../components/UI/Inputs';
import Card from '../components/UI/Card';
import { Header } from '../components/UI/Typography';
import Button from '../components/UI/Button';
import { apiAuthRoutes } from "../data/Routes";
import axios from "axios";

const LoginPrompt = ({ onLogin, message, loading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [formValid, setFormValid] = useState({ email: true, password: true });

    const login = (e) => {
        e.preventDefault();

        const emailValid =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                email.toLowerCase()
            );

        const passwordValid = password.length > 0;

        setFormValid({
            email: emailValid,
            password: passwordValid,
        });

        const credentials = {
            email,
            password,
        };
        onLogin(credentials);
    };

    const errorMessage =
        message &&
        (message.response ? message.response.data.detail : message.toJSON().message);

    return (
        <div className="flex flex-col items-center justify-center my-auto flex-grow">
            {errorMessage && (
                <p className={'text-red-500 pb-2 font-semibold text-lg'}>
                    {errorMessage}
                </p>
            )}
            <Card>
                <Header ariaLabel="Login to your account">Login to your account</Header>
                <p className="text-sm mt-4 font-medium leading-none text-gray-500 mb-5">
                    Forgot your password?{' '}
                    <Link
                        href={'/forgot-password'}
                        aria-label="Forgot Password"
                    >
                        <a className="text-sm font-medium leading-none underline text-gray-800 cursor-pointer">Forgot Password</a>
                    </Link>
                </p>

                <TextInput
                    label={'Email'}
                    value={email}
                    setValue={setEmail}
                    invalid={!formValid.email}
                />
                <PasswordInput
                    value={password}
                    setValue={setPassword}
                    invalid={!formValid.password}
                    className={'mt-6'}
                    toggleHidden={() => setPasswordVisible((prev) => !prev)}
                    hidden={!passwordVisible}
                />

                <div className="mt-8">
                    <Button
                        onClick={login}
                        disabled={loading}
                        aria-label={'login to my account'}
                    >
                        Login
                    </Button>
                </div>
            </Card>

            {loading && (
                <Loading
                    style={{
                        position: 'relative',
                        marginTop: '2rem',
                    }}
                />
            )}
        </div>
    );
};

const OtpPrompt = () => {
    const [otp, setOtp] = useState('');
    const [otpValid, setOtpValid] = useState(true);
    const [message, setMessage] = useState({ error: false, value: '' });

    const { mutate } = useUser();

    const login = async () => {
        if (otp.trim().length !== 6) {
            setOtpValid(false);
            return;
        }
        setOtpValid(true);

        validateUserLogin({ otp: +otp })
            .then((resp) => {
                setMessage({
                    error: false,
                    value: 'Login successful! You will be redirected shortly..',
                });
                mutate(null);
            })
            .catch((resp) => {
                setMessage({
                    error: true,
                    value: 'Invalid OTP entered',
                });
            });
    };

    const resendOtp = () => {
        axios.post(apiAuthRoutes.resendOtp).then(resp => {
            setMessage({
                error: false,
                value: 'OTP resent successfully',
            });
        }).catch(e => {
            setMessage({
                error: true,
                value: 'OTP could not be sent',
            });
        })
    }

    return (
        <div className="flex flex-col items-center justify-center my-auto flex-grow">
            {message.value && (
                <p
                    className={`text-${message.error ? 'red' : 'emerald'
                        }-500 pb-2 font-semibold text-lg`}
                >
                    {message.value}
                </p>
            )}

            <Card>
                <Header ariaLabel="Enter OTP">Enter OTP</Header>
                <p className="text-sm mt-4 font-medium leading-none text-gray-500">
                    Please enter the OTP sent on your email.{' '}
                    <a
                        href={'#'}
                        className="text-sm font-medium leading-none underline text-gray-800 cursor-pointer"
                        aria-label="Resend OTP"
                        onClick={resendOtp}
                    >
                        {' '}
                        Didn&apos;t receive?
                    </a>
                </p>
                <br className={'my-5'} />

                <TextInput
                    label={'OTP'}
                    value={otp}
                    setValue={setOtp}
                    invalid={!otpValid}
                />

                <div className="mt-8">
                    <button
                        role="button"
                        aria-label="create my account"
                        className={`duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 text-sm font-semibold leading-none text-white focus:outline-none border rounded py-4 w-full hover:bg-sky-600 bg-sky-500`}
                        onClick={login}
                    >
                        Login
                    </button>
                </div>
            </Card>
        </div>

    );
};

function Login() {
    const [loginData, makeLoginRequest] = useAxiosData();

    const login = (credentials) => {
        makeLoginRequest(
            loginUser({
                ...credentials,
                medium: 'email',
            })
        );
    };

    if (loginData.data) {
        return <OtpPrompt />;
    }

    return (
        <LoginPrompt
            message={loginData.error}
            onLogin={login}
            loading={loginData.loading}
        />
    );
}

Login.forAnonymous = true;

export default Login;
