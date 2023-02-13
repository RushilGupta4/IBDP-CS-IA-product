import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from 'components/UI/CheckboxDropdown.module.scss';
import { BsTriangleFill } from 'react-icons/bs';
import Button from 'components/UI/Button';

function CheckboxDropdown({ data, setData, className }) {
  const [open, setOpen] = useState(false);

  const isModified = data.some((x) => !x.selected);

  const setAll = (value) => {
    const toChange = data.map((x) => {
      return {
        option: x.value,
        selected: value,
      };
    });
    setData(toChange);
  };

  return (
    <div className={styles.container}>
      <span
        className={styles.container}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <BsTriangleFill
          className={`${styles.arrow} ${isModified ? styles.selected : ''}`}
        />

        {open && (
          <span className={styles.tooltip}>
            <Button className={styles.resetButton} onClick={() => setAll(true)}>
              Select All
            </Button>
            <Button
              className={`${styles.resetButton} ${styles.red}`}
              onClick={() => setAll(false)}
            >
              Deselect All
            </Button>

            {data.map((option) => {
              return (
                <span key={option.value}>
                  <input
                    type={'checkbox'}
                    checked={option.selected}
                    onChange={(e) =>
                      setData([
                        {
                          option: option.value,
                          selected: e.target.checked,
                        },
                      ])
                    }
                  />
                  <p>{option.value}</p>
                </span>
              );
            })}
          </span>
        )}
      </span>
    </div>
  );
}

CheckboxDropdown.propTypes = {
  data: PropTypes.array.isRequired,
  setData: PropTypes.func.isRequired,
  className: PropTypes.string,
};

CheckboxDropdown.defaultProps = {
  className: '',
};

export default CheckboxDropdown;
