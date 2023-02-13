import { useState } from 'react';
import { useRouter } from "next/router";
import {
    validateRegister
} from '../utils/userApi';
import useAxiosData from '../hooks/useAxiosData';
import Loading from '../components/UI/Loading';
import { PasswordInput, TextInput } from '../components/UI/Inputs';
import Card from '../components/UI/Card';
import { Header } from '../components/UI/Typography';
import Button from '../components/UI/Button';

const RegisterPrompt = ({ onVerify, response }) => {
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [rePassword, setRePassword] = useState('');
    const [rePasswordVisible, setRePasswordVisible] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [formValid, setFormValid] = useState({ password: true, rePassword: true });

    const { query } = useRouter();
    const router = useRouter();

    const doneFunction = () => {
        router.push("/")
    }

    if (query.token === false) {
        doneFunction()
    }
    const loading = response.loading;

    const validateRegister = (e) => {
        e.preventDefault();

        const passwordValid = password.length > 0;
        const rePasswordValid = rePassword === password

        setFormValid({
            password: passwordValid,
            rePassword: rePasswordValid,
        });

        const credentials = {
            firstName,
            lastName,
            token: query.token,
            password,
            rePassword,
        };
        onVerify(credentials);
    };

    return (
        <div className="flex flex-col items-center justify-center my-auto flex-grow">
            {(response.data || response.error) && (
                <p
                    className={`text-${response.error ? 'red' : 'emerald'
                        }-500 pb-2 font-semibold text-lg`}
                >
                    {
                        response.error ? "Invalid Request" : response.data.message
                    }
                </p>
            )}

            {(response.data && !(response.error)) && setTimeout(doneFunction, 2000) && <p />}

            <Card>
                <Header ariaLabel="Create an account">Create an account</Header>
                <p className="text-sm mt-4 font-medium leading-none text-gray-500 mb-5">
                    Fill in your details
                </p>

                <TextInput
                    className={'mt-6'}
                    label={'First Name'}
                    value={firstName}
                    setValue={setFirstName}
                    invalid={false}
                />

                <TextInput
                    className={'mt-6'}
                    label={'Last Name'}
                    value={lastName}
                    setValue={setLastName}
                    invalid={false}
                />

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
                        onClick={validateRegister}
                        disabled={loading}
                        aria-label={'Create my account'}
                    >
                        Register
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

function VerifyEmail() {
    const [requestData, makeVerificationRequest] = useAxiosData();

    const verifyEmail = (credentials) => {
        makeVerificationRequest(
            validateRegister({
                ...credentials,
            })
        );
    };

    return (
        <RegisterPrompt
            response={requestData}
            onVerify={verifyEmail}
        />
    );
}

VerifyEmail.forAnonymous = true;

export default VerifyEmail;
