import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CheckboxDropdown from 'components/UI/CheckboxDropdown';
import propTypes from 'prop-types';

const RenderRow = ({ keys, data, index, generateClassName }) => {
  const className = generateClassName && generateClassName(data, index);

  return (
    <tr>
      {keys.map((key, index) => {
        return (
          <td
            key={index}
            className={`px-5 py-5 border-b border-gray-200 bg-white text-sm transition-colors ${
              className ? className : ''
            }`}
          >
            <p className={'text-gray-900 whitespace-pre'}>{data[key]}</p>
          </td>
        );
      })}
    </tr>
  );
};

export default function Table({ data, getRowClass }) {
  if (data == null) data = [];

  const getKeys = () => {
    return Object.keys(data[0]);
  };

  const [filterData, setFilterData] = useState(
    getKeys().reduce((map, key) => {
      map[key] = [...new Set(data.map((x) => x[key]))].map((uniqueValue) => {
        return {
          selected: true,
          value: uniqueValue,
        };
      });
      return map;
    }, {})
  );

  const setSelected = (key, data) => {
    setFilterData((prevState) => {
      const newState = { ...prevState };
      data.forEach((x) => {
        newState[key].filter((y) => y.value === x.option)[0].selected =
          x.selected;
      });
      return newState;
    });
  };

  const getHeader = () => {
    const keys = getKeys();
    return (
      <thead>
        <tr>
          {keys.map((key, index) => (
            // <div className={styles.headerContainer} key={index}>
            //   <p
            //     className={`${styles.header} ${
            //       filterData[key].length <= 1 ? styles.spacedHeader : ''
            //     }`}
            //   >
            <th
              key={index}
              className={
                'px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider'
              }
            >
              {key.toUpperCase()}
              {filterData[key].length > 1 && (
                <CheckboxDropdown
                  data={filterData[key]}
                  setData={(data) => setSelected(key, data)}
                />
              )}
            </th>
          ))}
          {/*// </p>*/}
          {/*{filterData[key].length > 1 && (*/}
          {/*  <CheckboxDropdown*/}
          {/*    data={filterData[key]}*/}
          {/*    setData={(data) => setSelected(key, data)}*/}
          {/*    className={styles.dropDown}*/}
          {/*  />*/}
          {/*)}*/}
          {/*  // </div>*/}
          {/*  ))}*/}
        </tr>
      </thead>
    );
  };

  const getRowsData = () => {
    const keys = getKeys();
    const renderData = data.filter((row) => {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const filter = filterData[key];
        for (let j = 0; j < filter.length; j++) {
          if (filter[j].selected) continue;
          if (filter[j].value === row[key]) return false;
        }
      }
      return true;
    });
    return (
      <tbody>
        {renderData.map((row, index) => {
          return (
            <RenderRow
              generateClassName={getRowClass}
              key={index}
              data={row}
              keys={keys}
              index={index}
            />
          );
        })}
      </tbody>
    );
  };

  return (
    <div className="-mx-4 px-4 sm:px-8 py-4 overflow-x-auto">
      <div className="inline-block min-w shadow rounded-lg overflow-hidden min-w-full">
        <table className="min-w-full leading-normal">
          {getHeader()}
          {getRowsData()}
        </table>
      </div>
    </div>
  );
}

Table.propTypes = {
  data: PropTypes.array.isRequired,
  getRowClass: propTypes.func,
};
