import React, { useState, useEffect, useRef } from "react";
import Card from "../../components/UI/Card";
import useAxiosData from "../../hooks/useAxiosData";
import { apiAccountRoutes } from "../../data/Routes";
import axios from "axios";

const Application = ({ application }) => {
  return (
    <div className="w-11/12 py-2 my-2 px-0 md:px-8 lg:px-16 border rounded m-auto border-black">
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
      <div className="w-full flex flex-row justify-center md:justify-start mt-5">
        <b className={"pr-1"}>Status: </b>
        <p>{application.decision}</p>
      </div>
    </div>
  );
};

function PastApplications() {
  const msgRef = useRef(null);
  const [applications, setApplications] = useAxiosData();
  const [rsp, setRsp] = useAxiosData();
  const [resTime, setResTime] = useState();

  const updateApplication = (applicationId, decision) => {
    setRsp(
      axios.patch(apiAccountRoutes.leaveApplication, {
        applicationId,
        decision,
      })
    );
    setResTime(Date.now());
    setApplications(
      axios.post(apiAccountRoutes.seeLeaveApplication, {
        current: false,
        getAll: true,
      })
    );
  };

  useState(() => {
    if (!applications.data && !applications.loading && !applications.error) {
      setApplications(
        axios.post(apiAccountRoutes.seeLeaveApplication, {
          current: false,
          getAll: true,
        })
      );
    }
  }, [applications, setApplications]);

  if (resTime && Date.now() - resTime < 2000) {
    if (rsp.data) {
      console.log("ASDASDa");
      msgRef.current.innerText = rsp.data.message;
      msgRef.current.style.color = "green";
    } else if (rsp.error) {
      msgRef.current.innerText = rsp.error.data.message;
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
          Past/Pending Leave Applications
        </h1>

        {applications.data && applications.data.length > 0 ? (
          <div className="flex flex-col mt-4 border rounded border-black h-96 overflow-y-scroll">
            {applications.data.map((application) => (
              <Application
                application={application}
                key={`leaveApplication${applications.data.indexOf(
                  application
                )}`}
                onClick={updateApplication}
              />
            ))}
          </div>
        ) : (
          <p className="text-2xl text-center w-full font-bold p-5 mt-5 border border-black rounded">
            No Past/Pending Leave Applications
          </p>
        )}
      </Card>
    </div>
  );
}

PastApplications.forEmployee = true;
export default PastApplications;
