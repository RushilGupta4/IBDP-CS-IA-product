import React from 'react';
import {Header} from '../components/UI/Typography';
import Button from '../components/UI/Button';
import {TextInput} from '../components/UI/Inputs';

function HrLeave() {
    return (
        <div className="flex flex-col items-center justify-center my-auto flex-grow">
            <div
                className={`bg-white shadow rounded lg:w-2/5 md:w-2/3 w-5/6 p-10 items-center justify-center`}
            >
                <Header ariaLabel="Apply For Leave">Pending Applications</Header>
                <p className="text-sm mt-4 font-medium leading-none text-gray-500 mb-5"></p>

                <div className={'mt-5 rounded outline outline-1 p-4'}>
                    <label className={`text-sm font-medium leading-none text-gray-800 font-semibold`}>Employee Name:</label>
                    <br/>
                    <label className={`text-sm font-medium leading-none text-gray-800`}>[Employee Name Here]</label>
                    <br/>
                    <br/>
                    <label className={`text-sm font-medium leading-none text-gray-800 font-semibold`}>Start Date:</label>
                    <br/>
                    <label className={`text-sm font-medium leading-none text-gray-800`}>[Start Date Here]</label>
                    <br/>
                    <br/>
                    <label className={`text-sm font-medium leading-none text-gray-800 font-semibold`}>End Date:</label>
                    <br/>
                    <label className={`text-sm font-medium leading-none text-gray-800`}>[End Date Here]</label>
                    <br/>
                    <br/>
                    <label className={`text-sm font-medium leading-none text-gray-800 font-semibold`}>Reason:</label>
                    <br/>
                    <label className={`text-sm font-medium leading-none text-gray-800`}>[Reason Here]</label>

                    <div className="mt-8 items-center justify-center">
                        <Button className={'bg-green-600'} aria-label={'Allow!'}>Allow</Button>
                        <Button className={'bg-red-600 mt-1'} aria-label={'Reject!'}>Reject</Button>
                    </div>

                </div>

            </div>
        </div>
    );
}

HrLeave.isAnonymous = true;

export default HrLeave;
