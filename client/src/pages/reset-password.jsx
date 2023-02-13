import { useState } from 'react';
import { useRouter } from "next/router";
import {
    resetPassword
} from '../utils/userApi';
import useAxiosData from '../hooks/useAxiosData';
import Loading from '../components/UI/Loading';
import { PasswordInput } from '../components/UI/Inputs';
import Card from '../components/UI/Card';
import { Header } from '../components/UI/Typography';
import Button from '../components/UI/Button';

const RegisterPrompt = ({ onReset, response }) => {
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [rePassword, setRePassword] = useState('');
    const [rePasswordVisible, setRePasswordVisible] = useState(false);

    const [formValid, setFormValid] = useState({ password: true, rePassword: true });

    const { query } = useRouter();
    const router = useRouter();

    const doneFunction = () => {
        router.push("/")
    }

    if (query.token === false || query.id === false) {
        doneFunction()
    }
    const loading = response.loading;

    const resetPassword = (e) => {
        e.preventDefault();

        const passwordValid = password.length > 0;
        const rePasswordValid = rePassword === password

        setFormValid({
            password: passwordValid,
            rePassword: rePasswordValid,
        });

        const credentials = {
            token: query.token,
            id: query.id,
            password,
            rePassword,
        };
        onReset(credentials);
    };

    return (
        <div className="flex flex-col items-center justify-center my-auto flex-grow">
            {(response.data || response.error) && (
                <p
                    className={`text-${response.error ? 'red' : 'emerald'
                        }-500 pb-2 font-semibold text-lg`}
                >
                    {
                        response.error ? "Request Expired" : response.data.message
                    }
                </p>
            )}

            {(response.data && !(response.error)) && setTimeout(doneFunction, 2000) && <p />}
            <Card>
                <Header ariaLabel="Reset Password">Reset Password</Header>
                <p className="text-sm mt-4 font-medium leading-none text-gray-500 mb-5">
                    Choose new password
                </p>

                <PasswordInput
                    value={password}
                    setValue={setPassword}
                    invalid={!formValid.password}
                    className={'mt-6'}
                    toggleHidden={() => setPasswordVisible((prev) => !prev)}
                    hidden={!passwordVisible}
                />

                <PasswordInput
                    value={rePassword}
                    setValue={setRePassword}
                    invalid={!formValid.rePassword}
                    className={'mt-6'}
                    toggleHidden={() => setRePasswordVisible((prev) => !prev)}
                    label={"Re-Password"}
                    hidden={!rePasswordVisible}
                />

                <div className="mt-8">
                    <Button
                        onClick={resetPassword}
                        disabled={loading}
                        aria-label={'Change my password'}
                    >
                        Done
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

function ResetPassword() {
    const [requestData, makeResetPasswordRequest] = useAxiosData();

    const _resetPassword = (credentials) => {
        makeResetPasswordRequest(
            resetPassword({
                ...credentials,
            })
        );
    };

    return (
        <RegisterPrompt
            response={requestData}
            onReset={_resetPassword}
        />
    );
}

ResetPassword.forAnonymous = true;

export default ResetPassword;
