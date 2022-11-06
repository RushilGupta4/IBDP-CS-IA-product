import React, { Fragment } from 'react';
import NavLink from '../Utils/Navlink';
import Link from 'next/Link';
import { logout } from '../../utils/userApi';
import Image from "next/image";
import styles from "../../styles/Navbar.module.css";


function HallOfFame() {

}


HallOfFame.forAdmin = true;
HallOfFame.forEmployee = true;
export default HallOfFame;
