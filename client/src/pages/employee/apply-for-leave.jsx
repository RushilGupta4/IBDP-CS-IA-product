import React, { useState, useRef } from "react";
import axios from "axios";
import { apiAccountRoutes } from "../../data/Routes";
import useAxiosData from "../../hooks/useAxiosData";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

const Input = ({ labelText, value, inputType, onchange, refObj }) => {
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
        ref={refObj}
      />
    </div>
  );
};

const ApplyForLeave = (
  fromDateRef,
  toDateRef,
  reasonRef,
  msgRef,
  makeRequest,
  setRespTime
) => {
  const fromDate = fromDateRef.current.value;
  const toDate = toDateRef.current.value;
  const reason = reasonRef.current.value;

  if (!fromDate || !toDate || !reason) {
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

  makeRequest(
    axios.post(apiAccountRoutes.leaveApplication, {
      startDate: fromDate,
      endDate: toDate,
      reason,
    })
  );
  setRespTime(Date.now());
};

function PastApplications() {
  const msgRef = useRef(null);

  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const reasonRef = useRef(null);

  const [rsp, makeRequest] = useAxiosData();
  const [respTime, setRespTime] = useState();

  if (respTime && Date.now() - respTime < 2000) {
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
          Past Leave Applications
        </h1>

        <div className="w-11/12 py-5 my-2 px-2 md:px-8 lg:px-16 border rounded m-auto border-black">
          <div className={"flex flex-col md:flex-row justify-between"}>
            <Input
              refObj={fromDateRef}
              labelText={"Start Date"}
              inputType={"date"}
            />
            <Input
              refObj={toDateRef}
              labelText={"End Date"}
              inputType={"date"}
            />
          </div>
          <div
            className={"flex flex-col justify-between mt-3 w-full p-0 md:px-2"}
          >
            <label className={"text-sm text-center font-bold"}>Reason</label>
            <textarea
              className={"border-2 border-gray-300 rounded-md p-2 w-full h-32"}
              ref={reasonRef}
              maxlength={"512"}
            />
          </div>
          <div
            className={"flex flex-col justify-between mt-3 w-full p-0 md:px-2"}
          >
            <Button
              onClick={() =>
                ApplyForLeave(
                  fromDateRef,
                  toDateRef,
                  reasonRef,
                  msgRef,
                  makeRequest,
                  setRespTime
                )
              }
              className={"w-full h-1/2 m-0 md:mt-4"}
            >
              Submit
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

PastApplications.forEmployee = true;
export default PastApplications;
