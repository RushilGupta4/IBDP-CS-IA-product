import '../styles/globals.scss';
import Layout from '../components/UI/Layout';
import AdminPage from '../components/Auth/AdminPage';
import EmployeePage from '../components/Auth/EmployeePage';
import AnonymousPage from '../components/Auth/AnonymousPage';
import Head from 'next/head'
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function MyApp({ Component, pageProps }) {
  const forAdmin = Component.forAdmin;
  const forEmployee = Component.forEmployee;
  const forAnonymous = Component.forAnonymous;
  const router = useRouter();

  let ogName = Component.name;
  let name = [ogName.charAt(0)];

  for (let i = 1; i < ogName.length; i++) {
    if (ogName.charAt(i) == ogName.charAt(i).toUpperCase()) {
      name.push(" ")
    }
    name.push(ogName.charAt(i))
  }
  name = name.join("")

  if (name.length <= 0) {
    name = `Home`
  }

  if ((forAdmin && forAnonymous) || (forEmployee && forAnonymous)) {
    throw new Error(
      `The component ${name} is anonymous and protected as the same time. Please choose either one`
    );
  }

  return (
    <Layout>
      <Head>
        <link rel="shortcut icon" href={`/favicon.png`} />
        <title>{name} | CSIA</title>
      </Head>
      {
        forAdmin ? (
          <AdminPage>
            <Component {...pageProps} />
          </AdminPage>
        ) : forEmployee ? (
          <EmployeePage>
            <Component {...pageProps} />
          </EmployeePage>
        ) : forAnonymous ? (
          <AnonymousPage>
            <Component {...pageProps} />
          </AnonymousPage>
        ) : (
          <Component {...pageProps} />
        )
      }
    </Layout>
  );
}

// Add just so IDE doesn't complain :)
MyApp.isProtected = false;
MyApp.isAnonymous = false;

export default MyApp;
