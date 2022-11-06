import { useState } from 'react';
import {
    forgotPassword,
} from '../utils/userApi';
import Loading from '../components/UI/Loading';
import useAxiosData from '../hooks/useAxiosData';
import { TextInput } from '../components/UI/Inputs';
import Card from '../components/UI/Card';
import { Header } from '../components/UI/Typography';
import Button from '../components/UI/Button';


const ForgotPasswordPrompt = ({ onForgot, requestData }) => {
    const [email, setEmail] = useState('');
    const [formValid, setFormValid] = useState({ email: true });

    const loading = requestData.loading;

    const forgotPassword = (e) => {
        e.preventDefault();

        const emailValid =
            email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

        setFormValid({
            email: emailValid,
        });

        onForgot(email);
    };

    return (
        <div className="flex flex-col items-center justify-center my-auto flex-grow">
            {(requestData.data || requestData.error) && (
                <p
                    className={`text-${requestData.error ? 'red' : 'emerald'
                        }-500 pb-2 font-semibold text-lg`}
                >
                    {
                        requestData.error ? "Email Not Registered" : requestData.data.message
                    }
                </p>
            )}

            <Card>
                <Header ariaLabel="Forgot Password">Forgot Password</Header>
                <br />

                <TextInput
                    label={'Email'}
                    value={email}
                    setValue={setEmail}
                    invalid={!formValid.email}
                />

                <div className="mt-8">
                    <Button
                        onClick={forgotPassword}
                        disabled={loading}
                        aria-label={'Send Email'}
                    >
                        Send Email
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

function ForgotPassword() {
    const [requestData, makeForgotPasswordRequest] = useAxiosData();

    const _forgotPassword = (email) => {
        makeForgotPasswordRequest(
            forgotPassword({
                email
            })
        );
    };

    return (
        <ForgotPasswordPrompt
            requestData={requestData}
            onForgot={_forgotPassword}
        />
    );
}

ForgotPassword.forAnonymous = true;

export default ForgotPassword;
