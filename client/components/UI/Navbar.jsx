import React, { Fragment } from 'react';
import useUser from '../../hooks/useUser';
import NavLink from '../Utils/Navlink';
import Link from '../Utils/Link';
import NextLink from 'next/link';
import { logout } from '../../utils/userApi';

// This is used to be easily able to change the list element
const NavbarItem = ({ to, children, exact }) => {
  return (
    <NavLink
      to={to}
      exact={exact}
      activeClassName={'text-gray-900'}
      className="mr-5 hover:text-gray-900"
    >
      {children}
    </NavLink>
  );
};

const AuthOnly = () => {
  const { mutate } = useUser();
  return (
    <Fragment>
      <a
        href={'#'}
        className={'md:mr-3 hover:text-gray-900'}
        onClick={async () => {
          await logout();
          mutate(null);
        }}
      >
        Logout
      </a>
    </Fragment>
  );
};

const AnonymousOnly = () => {
  return (
    <Fragment>
        <NextLink href={'/login'}>
            <button className="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">
                Login
                <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-4 h-4 ml-1"
                    viewBox="0 0 24 24"
                >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </button>
        </NextLink>
    </Fragment>
  );
};

function Navbar() {
  const { loggedIn } = useUser();

  return (
    <header className="text-gray-600 body-font">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <Link
          href={'/'}
          className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"
        >
          <span className="ml-3 text-xl">CS IA</span>
        </Link>
        <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
          {loggedIn ? <AuthOnly /> : <AnonymousOnly />}
        </nav>
      </div>
    </header>
  );

}

export default Navbar;
