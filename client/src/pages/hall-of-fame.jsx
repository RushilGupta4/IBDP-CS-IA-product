import React, { Fragment } from "react";
import Card from "../components/UI/Card";
import useAxiosData from "../hooks/useAxiosData";
import axios from "axios";
import { apiAccountRoutes } from "../data/Routes";
import Button from "../components/UI/Button";

const getHallOfFame = async ({ month, year }) => {
  return await axios.post(apiAccountRoutes.seeHallOfFame, {
    month,
    year,
  });
};

const Input = ({ labelText, value, onChange }) => {
  return (
    <div className={"flex p-2"}>
      <p className={"px-2 w-1/2 text-center"}>{labelText}:</p>
      <input
        className={"border text-center w-full"}
        type={"number"}
        min="1"
        id={`${labelText}Tag`}
        defaultValue={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
      />
    </div>
  );
};

function HallOfFame() {
  const date = new Date();
  date.setDate(date.getDate() - 30);

  const [data, setData] = useAxiosData();
  const [firstReq, setFirstReq] = React.useState(true);

  const [payload, setPayload] = React.useState({
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  });

  const getHofData = () => {
    if (!data.loading) {
      setFirstReq(false);
      setData(getHallOfFame(payload));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center my-auto flex-grow">
      <Card className={"!w-4/5 md:!w-3/5 justify-items-center"}>
        <h1 className="text-2xl font-bold text-center">Hall of Fame</h1>
        <p className="text-4xl font-bold text-center m-5 p-5">
          {firstReq
            ? ""
            : Boolean(data.data)
            ? `${data.data.first_name} ${data.data.last_name}`
            : "N/A"}
        </p>
        <div className="flex flex-col md:flex-row justify-center mt-4">
          <Input
            labelText={"Month"}
            value={date.getMonth() + 1}
            onChange={(val) => {
              let finalVal = val < 0 ? Math.abs(val) : val;
              if (finalVal > 12) {
                finalVal = 12;
              }
              setPayload({ month: finalVal, year: payload.year });
            }}
          />
          <Input
            labelText={"Year"}
            value={date.getFullYear()}
            onChange={(val) => {
              let finalVal = val < 0 ? Math.abs(val) : val;
              setPayload({ year: finalVal, month: payload.month });
            }}
          />
        </div>
        <div className={"flex justify-center"}>
          <Button onClick={getHofData} className={"w-full md:w-3/5 mt-2"}>
            Submit
          </Button>
        </div>
      </Card>
    </div>
  );
}

HallOfFame.forAdmin = true;
HallOfFame.forEmployee = true;
export default HallOfFame;
