import React, { Fragment } from 'react';
import Navbar from '../../components/UI/Navbar';

function Layout({ children }) {
  return (
    <Fragment>
      <Navbar />
      <div className={'flex flex-col flex-grow'}>{children}</div>
    </Fragment>
  );
}

export default Layout;
