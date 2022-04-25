import React from 'react';
import {Header} from '../components/UI/Typography';
import Button from '../components/UI/Button';
import {TextInput} from '../components/UI/Inputs';

function EmployeeLeave() {
    return (
        <div className="flex flex-col items-center justify-center my-auto flex-grow">
            <div
                className={`bg-white shadow rounded lg:w-2/5 md:w-2/3 w-5/6 p-10 items-center justify-center`}
            >
                <Header ariaLabel="Apply For Leave">Apply For Leave</Header>
                <p className="text-sm mt-4 font-medium leading-none text-gray-500 mb-5"></p>

                <label className={`text-sm font-medium leading-none text-gray-800 font-semibold`}>Start Date:</label>
                <br/>
                <input
                    type={'date'}
                />
                <br/>
                <br/>
                <label className={`text-sm font-medium leading-none text-gray-800 font-semibold`}>End Date:</label>
                <br/>
                <input
                    type={'date'}
                />
                <br/>
                <br/>

                <TextInput
                    label={'Reason'}
                />

                <div className="mt-8 items-center justify-center">
                    <Button aria-label={'Apply!'}>Submit</Button>
                </div>
            </div>
        </div>
    );
}

EmployeeLeave.isAnonymous = true;

export default EmployeeLeave;
