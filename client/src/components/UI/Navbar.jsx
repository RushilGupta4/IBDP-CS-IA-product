import React, { Fragment } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import NavLink from "../Utils/Navlink";
import { logout } from "../../utils/userApi";
import useUser from "../../hooks/useUser";
import styles from "../../styles/Navbar.module.css";

// This is used to be easily able to change the list element
const NavbarItem = ({ to, children, exact }) => {
  return (
    <NavLink
      to={to}
      exact={exact}
      activeClassName={"text-gray-900"}
      className="mr-7 hover:text-gray-900 my-1"
    >
      {children}
    </NavLink>
  );
};

const NavbarItemHighlighted = ({ to, onClick, children }) => {
  return (
    <Link href={to}>
      <button
        className="inline-flex items-center bg-gray-100 border py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base md:mt-0 mr-3 border-gray-200 my-1"
        onClick={onClick}
      >
        {children}
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
    </Link>
  );
};

const AuthOnly = ({ userData }) => {
  const { mutate } = useUser();
  const router = useRouter();

  return (
    <Fragment>
      <NavbarItem to={"/dashboard"}>Dashboard</NavbarItem>
      {userData.user.isAdmin ? (
        <NavbarItemHighlighted to={"/register"}>Register</NavbarItemHighlighted>
      ) : null}

      <NavbarItemHighlighted
        to={"#"}
        onClick={async () => {
          await logout();
          await mutate(null);
          router.push("/");
        }}
      >
        Logout
      </NavbarItemHighlighted>
    </Fragment>
  );
};

const AnonymousOnly = () => {
  return (
    <Fragment>
      <NavbarItem to={"/login"}>Login</NavbarItem>
    </Fragment>
  );
};

function Navbar() {
  const userData = useUser();

  return (
    <header className="text-gray-600 body-font">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <Link href={"/"}>
          <div className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
            <Image
              src={`/favicon.ico`}
              className={styles.logo}
              width={60}
              height={60}
            />
            <span className="ml-3 text-xl">CSIA</span>
          </div>
        </Link>
        <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
          {userData.loggedIn ? (
            <AuthOnly userData={userData} />
          ) : (
            <AnonymousOnly />
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
