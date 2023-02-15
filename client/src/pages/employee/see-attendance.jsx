import React, { useState, useRef } from "react";
import axios from "axios";
import useAxiosData from "../../hooks/useAxiosData";
import { apiAccountRoutes } from "../../data/Routes";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

const AttendanceLog = ({ status, date }) => {
  return (
    <div className="flex justify-center my-2 mx-auto border border-black rounded">
      <div
        className={`
        w-2/5
        bg-${
          status.toLowerCase() === "present"
            ? "green"
            : status.toLowerCase() === "absent"
            ? "red"
            : "yellow"
        }-200
        rounded
        py-4
        `}
      >
        <p className="text-center align-middle">{date}</p>
      </div>
      <div className="w-3/5 py-4 flex flex-col justify-center">
        <p className="text-center px-2">{status}</p>
      </div>
    </div>
  );
};

function AttendanceLogs({ attendance }) {
  return (
    <div
      className={
        "border border-black mt-5 overflow-y-scroll bg-grey-400 w-full md:w-4/5 mx-auto h-64"
      }
    >
      {attendance &&
        Object.keys(attendance).map((date) => {
          const status = attendance[date];
          return <AttendanceLog key={date} status={status} date={date} />;
        })}
    </div>
  );
}

const getEmplyoeeAttendance = (fromDate, toDate) => {
  return axios.post(apiAccountRoutes.seeAttendance, {
    fromDate,
    toDate,
  });
};

const Input = ({ labelText, value, inputType, onchange }) => {
  return (
    <div
      className={
        "flex flex-col w-full md:!w-4/5 mx-0 md:mx-2 justify-center my-3 md:my-1"
      }
    >
      <label className={"text-sm text-center font-bold"}>{labelText}</label>
      <input
        className={"border-2 border-gray-300 rounded-md p-2 w-full"}
        defaultValue={value}
        type={inputType}
        onChange={onchange}
      />
    </div>
  );
};

function SeeAttendance() {
  const [attendance, setAttendance] = useAxiosData();

  const [toDateVal, setToDateVal] = useState("");
  const [fromDateVal, setFromDateVal] = useState("");

  const msgRef = useRef(null);

  const getAttendance = () => {
    if (!fromDateVal || !toDateVal) {
      msgRef.current.innerText = "Please fill all the fields";
      msgRef.current.style.color = "red";
      setTimeout(() => {
        if (!msgRef.current) {
          return;
        }
        msgRef.current.innerText = "";
      }, 2000);
      return;
    }

    setAttendance(getEmplyoeeAttendance(fromDateVal, toDateVal));
  };

  return (
    <div className="flex flex-col items-center justify-center my-auto flex-grow">
      <Card className={"!w-4/5 md:!w-4/7 justify-items-center flex flex-col"}>
        <p className="text-1xl font-bold text-center mb-3" ref={msgRef} />
        <h1 className="text-2xl font-bold text-center">See Attendance</h1>
        <div className="flex flex-col md:flex-row justify-center items-start mt-4">
          <Input
            labelText={"From Date"}
            inputType={"date"}
            value={fromDateVal}
            onchange={(e) => {
              setFromDateVal(e.target.value);
            }}
          />
          <Input
            labelText={"To Date"}
            inputType={"date"}
            value={toDateVal}
            onchange={(e) => {
              setToDateVal(e.target.value);
            }}
          />
          <div className="flex flex-col w-full md:!w-4/5 mx-0 md:mx-2 justify-center my-2 md:my-1">
            <Button
              onClick={getAttendance}
              className={"w-full h-1/2 m-0 md:mt-4"}
            >
              Submit
            </Button>
          </div>
        </div>
        {attendance.data && (
          <AttendanceLogs
            attendance={attendance.data ? attendance.data.attendance : {}}
          />
        )}
      </Card>
    </div>
  );
}

SeeAttendance.forEmployee = true;
export default SeeAttendance;
