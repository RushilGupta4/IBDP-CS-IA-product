import Head from 'next/head';
import '../styles/globals.css';
import Layout from '../components/UI/Layout';
import AdminPage from '../components/Auth/AdminPage';
import EmployeePage from '../components/Auth/EmployeePage';
import AuthPage from '../components/Auth/AuthPage';
import AnonymousPage from '../components/Auth/AnonymousPage';

function MyApp ( { Component, pageProps } )
{
  const forAdmin = Component.forAdmin;
  const forEmployee = Component.forEmployee;
  const forAnonymous = Component.forAnonymous;

  let ogName = Component.name;
  let name = [ ogName.charAt( 0 ) ];

  for ( let i = 1; i < ogName.length; i++ )
  {
    if ( ogName.charAt( i ) == ogName.charAt( i ).toUpperCase() )
    {
      name.push( " " );
    }
    name.push( ogName.charAt( i ) );
  }
  name = name.join( "" );

  if ( name.length <= 0 )
  {
    name = `Home`;
  }

  if ( ( forAdmin && forAnonymous ) || ( forEmployee && forAnonymous ) )
  {
    throw new Error(
      `The component ${ name } is anonymous and protected as the same time. Please choose either one`
    );
  }

  return (
    <Layout>
      <Head>
        <link rel="shortcut icon" href={`/favicon.png`} />
        <title>{name} | CSIA</title>
      </Head>
      {
        ( forAdmin && forEmployee ) ? (
          <AuthPage>
            <Component {...pageProps} />
          </AuthPage>
        ) : forAdmin ? (
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
