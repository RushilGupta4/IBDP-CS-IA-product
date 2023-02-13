import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import useAxiosData from "../../hooks/useAxiosData";
import { apiAccountRoutes } from "../../data/Routes";
import Button from "../../components/UI/Button";
import Card from "../../components/UI/Card";

const Application = ({ application }) => {
  const buttonClass = `text-sm font-semibold leading-none border border-black rounded w-2/5 mx-1 py-2 md:w-1/5 md:ml-4`;
  return (
    <div className="w-11/12 py-2 my-2 px-0 md:px-8 mx-auto lg:px-16 border rounded border-black">
      <div className={"flex flex-col md:flex-row justify-between"}>
        <p className="text-center">
          <b className={"pr-1"}>Employee Name: </b>
          <br className="visible md:hidden" />
          {application.employeeName}
        </p>
        <p className="text-center mt-2 md:mt-0">
          <b className={"pr-1"}>Application Date: </b>
          <br className="visible md:hidden" />
          {application.createdAt}
        </p>
      </div>
      <div className="w-2/3 md:w-1/3 mt-5 mx-auto md:mx-0 grid-cols-2 grid">
        <b className={"pr-1"}>Start: </b>
        <p>{application.startDate}</p>

        <b className={"pr-1"}>End: </b>
        <p>{application.endDate}</p>
      </div>
      <div className="w-5/6 mt-5 mx-auto md:mx-0">
        <p className="text-center md:text-left">
          <b>Reason: </b>
          <br />
          {application.reason}
        </p>
      </div>
      <div className="w-2/3 md:w-1/3 mt-5 mx-auto md:mx-0 grid-cols-2 grid">
        <b className={"pr-1"}>Decision: </b>
        <p>{application.decision}</p>
      </div>
    </div>
  );
};

function PastApplications() {
  const [employees, setEmployees] = useAxiosData();
  const [applications, setApplications] = useAxiosData();

  const getEmplyoees = () => {
    return axios.get(apiAccountRoutes.employees);
  };

  if (!employees.data && !employees.loading) {
    setEmployees(getEmplyoees());
  }

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const selectionRef = useRef(null);
  const msgRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const res = [];

      if (search.length <= 1) {
        return;
      }

      for (let i = 0; i < employees.data.length; i++) {
        const s = employees.data[i];
        if (s.name.toLowerCase().startsWith(search.toLowerCase())) {
          res.push(s);
        }

        if (res.length === 3) {
          break;
        }
      }

      setResults(res);
    }, 350);
    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  const getApplications = () => {
    const user = selectionRef.current.firstChild.value;

    if (user === "None") {
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

    setApplications(
      axios.post(apiAccountRoutes.seeLeaveApplication, {
        current: false,
        employee: user,
        getAll: false,
      })
    );
  };

  return (
    <div className="flex flex-col items-center justify-center my-auto flex-grow">
      <Card className={"!w-4/5 md:!w-4/7 justify-items-center flex flex-col"}>
        <p className="text-1xl font-bold text-center mb-3" ref={msgRef} />
        <h1 className="text-2xl font-bold text-center">
          Past Leave Applications
        </h1>
        <div className="flex flex-col md:flex-row justify-center items-start mt-4">
          <div className="flex flex-col w-full md:!w-4/5 mx-0 md:mx-2 justify-center my-1">
            <label className="text-sm text-center font-bold">Employee</label>
            <input
              type="text"
              className="
                form-control
                block
                w-full
                p-2
                text-base
                font-normal
                text-gray-700
                bg-white bg-clip-padding
                border border-solid border-gray-300
                rounded
                transition
                ease-in-out
                m-0
                focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
            "
              placeholder="Employee First Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              name="student"
              className="px-auto flex-grow rounded bg-gray-100 p-2"
              ref={selectionRef}
            >
              {results.length <= 0 && (
                <option value="None">Start typing to search</option>
              )}
              {results.map((res) => (
                <option key={res.email} value={res.email}>
                  {res.name} {`(${res.email})`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col w-full md:!w-4/5 mx-0 md:mx-2 justify-center my-2 md:my-1">
            <Button
              onClick={getApplications}
              className={"w-full h-1/2 m-0 md:mt-4"}
            >
              Submit
            </Button>
          </div>
        </div>
        {applications.data && applications.data.length > 0 ? (
          <div className="flex flex-col mt-4 border rounded h-96 border-black overflow-y-scroll">
            {applications.data.map((application) => (
              <Application
                application={application}
                key={`leaveApplication${applications.data.indexOf(
                  application
                )}`}
              />
            ))}
          </div>
        ) : (
          <p className="text-2xl text-center w-full font-bold p-5 mt-5 border border-black rounded">
            No Past Leave Applications
          </p>
        )}
      </Card>
    </div>
  );
}

PastApplications.forAdmin = true;
export default PastApplications;
