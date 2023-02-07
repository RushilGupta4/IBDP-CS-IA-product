import React, { useState, useEffect, useRef } from "react";
import Card from "../../components/UI/Card";
import useAxiosData from "../../hooks/useAxiosData";
import axios from "axios";
import { apiAccountRoutes } from "../../data/Routes";
import Button from "../../components/UI/Button";

const AttendanceLog = ({ email, employeeStat, onchange, chosenEmployee }) => {
  return (
    <div className="flex justify-center my-2 w-full border border-black rounded">
      <div className="w-1/2 py-4 flex flex-row justify-center">
        <div className="w-2/3 flex flex-row justify-start text-center pl-2">
          <input
            type="radio"
            name="employeeChoice"
            onChange={(e) => {
              let val = e.target.value === "on";
              if (val) {
                onchange(email);
              }
            }}
            checked={chosenEmployee === email}
          ></input>
          <label className={"pl-2"}>{employeeStat.name}</label>
        </div>
      </div>
      <div className="w-1/4 py-4 flex flex-col justify-center text-center">
        {employeeStat.stats.presentPercent}
      </div>
      <div className="w-1/4 py-4 flex flex-col justify-center text-center">
        {employeeStat.leaves}
      </div>
    </div>
  );
};

function AttendanceLogs({ employeeStats, onchange, chosenEmployee }) {
  const styles = {
    borderRight: "1px solid rgba(0, 0, 0, 1)",
  };

  return (
    <div
      className={
        "border border-black mt-5 overflow-auto bg-grey-400 w-full md:w-4/5 mx-auto h-64"
      }
    >
      <div className="flex justify-center w-full border border-black">
        <div
          className="w-1/2 flex flex-col justify-center text-center py-2"
          style={styles}
        >
          Employee Name
        </div>
        <div
          className="w-1/4 flex flex-col justify-center text-center py-2"
          style={styles}
        >
          Attendance
        </div>
        <div className="w-1/4 flex flex-col justify-center text-center py-2">
          Leaves
        </div>
      </div>

      {employeeStats &&
        Object.keys(employeeStats).map((email) => {
          let employeeStat = employeeStats[email];
          return (
            <AttendanceLog
              key={email}
              email={email}
              employeeStat={employeeStat}
              onchange={onchange}
              chosenEmployee={chosenEmployee}
            />
          );
        })}
    </div>
  );
}

const getEmplyoeeAttendance = async (employee, fromDate, toDate) => {
  return await axios.post(apiAccountRoutes.seeAttendance, {
    employee,
    fromDate,
    toDate,
  });
};

const updateHallOfFame = (employee, month, year) => {
  return axios.post(apiAccountRoutes.updateHallOfFame, {
    employee,
    month,
    year,
  });
};

const Input = ({ labelText, value, inputType, onchange, min, max, refObj }) => {
  return (
    <div
      className={
        "flex flex-col w-full md:!w-4/5 mx-0 md:mx-2 justify-center my-3 md:my-1"
      }
    >
      <label className={"text-sm text-center font-bold"}>{labelText}</label>
      <input
        className={"border-2 border-gray-300 rounded-md p-2 w-full text-center"}
        defaultValue={value}
        min={min}
        max={max}
        type={inputType}
        onChange={(e) => onchange(parseInt(e.target.value))}
        ref={refObj}
      />
    </div>
  );
};

function SeeEmployeeAttendance() {
  const date = new Date();
  const [chosenEmployee, setChosenEmployee] = useState(null);
  const [hallOfFame, setHallOfFame] = useAxiosData();
  const [rspTime, setRspTime] = useState(null);
  const [employees, setEmployees] = useAxiosData();
  const [employeeStats, setEmployeeStats] = useAxiosData();
  const [searchData, setSearchData] = useState({
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  });

  const msgRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(updateEmployeeStats, 350);
    return () => clearTimeout(timeout);
  }, [searchData]);

  const getEmplyoees = () => {
    return axios.get(apiAccountRoutes.employees);
  };

  const updateChosenEmployee = (email) => {
    setChosenEmployee(email);
  };

  const updateEmployeeStats = () => {
    const payload = searchData;

    let fromDate = new Date();
    fromDate.setDate(1);
    fromDate.setMonth(payload.month - 1);
    fromDate.setYear(payload.year);

    let toDate = new Date();
    toDate.setDate(1);
    toDate.setMonth(payload.month);
    toDate.setYear(payload.year);
    toDate.setDate(toDate.getDate() - 1);

    if (!employees.data) {
      return;
    }

    let employeeEmails = employees.data.map((employee) => {
      return employee.email;
    });

    setEmployeeStats(getEmplyoeeAttendance(employeeEmails, fromDate, toDate));
  };

  useEffect(() => {
    if (!employees.data && !employees.loading) {
      setEmployees(getEmplyoees());
    }

    if (employees.data && !employeeStats.data && !employeeStats.loading) {
      updateEmployeeStats();
    }
  }, [employees, employeeStats]);

  useEffect(() => {
    if (!chosenEmployee && employeeStats.data) {
      setChosenEmployee(Object.keys(employeeStats.data)[0]);
    }
  }, [employeeStats, chosenEmployee, setChosenEmployee]);

  const chooseEmployeeOfTheMonth = () => {
    setHallOfFame(
      updateHallOfFame(chosenEmployee, searchData.month, searchData.year)
    );
    setRspTime(Date.now());
  };

  useEffect(() => {
    if (rspTime && Date.now() - rspTime < 2000) {
      if (hallOfFame.data) {
        msgRef.current.innerText = hallOfFame.data.message;
        msgRef.current.style.color = "green";
      } else if (hallOfFame.error.response) {
        msgRef.current.innerText = hallOfFame.error.response.data.message;
        msgRef.current.style.color = "red";
      }
      setTimeout(() => {
        msgRef.current.innerText = "";
      }, 2000);
    }
  }, [rspTime, hallOfFame, msgRef]);

  return (
    <div className="flex flex-col items-center justify-center my-auto flex-grow">
      <Card className={"!w-4/5 md:!w-4/7 justify-items-center flex flex-col"}>
        <p className="text-1xl font-bold text-center mb-3" ref={msgRef} />
        <h1 className="text-2xl font-bold text-center">
          Choose Employee Of The Month
        </h1>
        <div className="flex flex-col md:flex-row justify-center items-start mt-4">
          <Input
            key={"month"}
            labelText={"Month"}
            value={searchData.month}
            inputType="number"
            min="1"
            max="12"
            onchange={(e) => setSearchData((old) => ({ ...old, month: e }))}
          />
          <Input
            key={"year"}
            labelText={"Year"}
            value={searchData.year}
            inputType="number"
            min="1"
            onchange={(e) => setSearchData((old) => ({ ...old, year: e }))}
            max="9999"
          />
          <div className="flex flex-col w-full md:!w-4/5 mx-0 md:mx-2 justify-center my-2 md:my-1">
            <Button
              onClick={chooseEmployeeOfTheMonth}
              className={"w-full h-1/2 m-0 md:mt-4"}
            >
              Submit
            </Button>
          </div>
        </div>
        {employeeStats.data && (
          <AttendanceLogs
            employeeStats={employeeStats.data}
            onchange={updateChosenEmployee}
            chosenEmployee={chosenEmployee}
          />
        )}
      </Card>
    </div>
  );
}

SeeEmployeeAttendance.forAdmin = true;
export default SeeEmployeeAttendance;
