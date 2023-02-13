import React, { useState, useRef } from "react";
import axios from "axios";
import useAxiosData from "../../hooks/useAxiosData";
import { apiAccountRoutes } from "../../data/Routes";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

const updateAttendanceState = (e, setAttendance, attendance, employee) => {
  let val = e.target.value;
  let data = attendance;
  data[employee.email] = val;
  setAttendance(data);
};

const AttendanceLog = ({ employee, setAttendance, attendance }) => {
  return (
    <div className="flex justify-center my-2 mx-auto border border-black rounded px-2">
      <div className="w-3/5 py-4 px-0 md:pl-8 md:pr-2 flex flex-col justify-center">
        <p className="text-left text-sm md:text-base">{employee.name}</p>
      </div>
      <div className={"w-2/5 py-3 flex flex-col justify-center px-0 md:px-2"}>
        <select
          className={
            "border border-black rounded h-full text-center text-sm md:text-base"
          }
          onChange={(e) =>
            updateAttendanceState(e, setAttendance, attendance, employee)
          }
          defaultValue={attendance[employee.email]}
        >
          <option>Present</option>
          <option>Not Expected</option>
          <option>Absent</option>
        </select>
      </div>
    </div>
  );
};

function AttendanceLogs({ employees, setAttendance, attendance }) {
  return (
    <div
      className={
        "border border-black mt-5 overflow-y-scroll bg-grey-400 w-full md:w-4/5 mx-auto h-64"
      }
    >
      {employees &&
        employees.map((employee) => {
          return (
            <AttendanceLog
              key={employee.email}
              employee={employee}
              setAttendance={setAttendance}
              attendance={attendance}
            />
          );
        })}
    </div>
  );
}

const takeEmplyoeeAttendance = (attendance) => {
  return axios.post(apiAccountRoutes.markAttendance, attendance);
};

function TakeAttendance() {
  const [employees, setEmployees] = useAxiosData();
  const [attendance, setAttendance] = useState(null);

  const [rsp, setRsp] = useAxiosData(null);
  const [rspTime, setRspTime] = useState(null);

  const msgRef = useRef(null);

  const getEmplyoees = () => {
    return axios.get(apiAccountRoutes.employees);
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

  if (!employees.data && !employees.loading) {
    setEmployees(getEmplyoees());
  }

  if (!attendance && employees.data) {
    let data = {};
    employees.data.map((employee) => {
      data[employee.email] = "Present";
    });
    setAttendance(data);
  }

  const [dateVal, setDateVal] = useState("");

  const markAttendance = () => {
    if (!dateVal) {
      msgRef.current.innerText = "Please fill the date field";
      msgRef.current.style.color = "red";
      setTimeout(() => {
        if (!msgRef.current) {
          return;
        }
        msgRef.current.innerText = "";
      }, 2000);
      return;
    }
    let attendanceData = {
      attendanceDate: dateVal,
      attendance: attendance,
    };

    setRsp(takeEmplyoeeAttendance(attendanceData));
    setRspTime(Date.now());
  };

  if (rspTime && Date.now() - rspTime < 2000) {
    if (rsp.data) {
      msgRef.current.innerText = rsp.data.message;
      msgRef.current.style.color = "green";
    } else if (rsp.error.response) {
      msgRef.current.innerText = rsp.error.response.data.message;
      msgRef.current.style.color = "red";
    }
    setTimeout(() => {
      if (!msgRef.current) {
        return;
      }
      msgRef.current.innerText = "";
    }, 2000);
  }

  return (
    <div className="flex flex-col items-center justify-center my-auto flex-grow">
      <Card className={"!w-4/5 md:!w-4/7 justify-items-center flex flex-col"}>
        <p className="text-1xl font-bold text-center mb-3" ref={msgRef} />
        <h1 className="text-2xl font-bold text-center">
          Take Employee Attendance
        </h1>
        <div className="flex flex-col md:flex-row justify-center items-start mt-4">
          <Input
            labelText={"Date"}
            inputType={"date"}
            value={dateVal}
            onchange={(e) => {
              setDateVal(e.target.value);
            }}
          />
          <div className="flex flex-col w-full md:!w-4/5 mx-0 md:mx-2 justify-center my-2 md:my-1">
            <Button
              onClick={markAttendance}
              className={"w-full h-1/2 m-0 md:mt-4"}
            >
              Confirm
            </Button>
          </div>
        </div>
        {employees.data && (
          <AttendanceLogs
            employees={employees.data}
            setAttendance={setAttendance}
            attendance={attendance}
          />
        )}
      </Card>
    </div>
  );
}

TakeAttendance.forAdmin = true;
export default TakeAttendance;
