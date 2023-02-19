import { useState } from 'react';
import {
  register,
} from '../utils/userApi';
import useAxiosData from '../hooks/useAxiosData';
import { TextInput } from '../components/UI/Inputs';
import Card from '../components/UI/Card';
import { Header } from '../components/UI/Typography';
import Button from '../components/UI/Button';
import Loading from '../components/UI/Loading';


const RegisterPrompt = ({ onRegister, registerData }) => {
  const [email, setEmail] = useState('');
  const [formValid, setFormValid] = useState({ email: true });

  const loading = registerData.loading;

  const register = (e) => {
    e.preventDefault();

    const emailValid =
      email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

    setFormValid({
      email: emailValid,
    });

    const credentials = {
      email,
    };
    onRegister(credentials);
  };

  return (
    <div className="flex flex-col items-center justify-center my-auto flex-grow">
      {(registerData.data || registerData.error) && (
        <p
          className={`text-${registerData.error ? 'red' : 'emerald'
            }-500 pb-2 font-semibold text-lg`}
        >
          {
            registerData.error ? "Email Already Registered" : registerData.data.message
          }
        </p>
      )}
      <Card>
        <Header ariaLabel="Create an account">Create an account</Header>
        <br />

        <TextInput
          label={'Email'}
          value={email}
          setValue={setEmail}
          invalid={!formValid.email}
        />

        <div className="mt-8">
          <Button
            onClick={register}
            disabled={loading}
            aria-label={'Create a new account'}
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

function Register() {
  const [registerData, makeRegisterRequest] = useAxiosData();

  const _register = (credentials) => {
    makeRegisterRequest(
      register({
        ...credentials,
        medium: 'email',
      })
    );
  };

  return (
    <RegisterPrompt
      registerData={registerData}
      onRegister={_register}
    />
  );
}

Register.forAdmin = true;
export default Register;
