import '../styles/globals.scss';
import Layout from '../components/UI/Layout';
import ProtectedPage from '../components/Auth/ProtectedPage';
import AnonymousPage from '../components/Auth/AnonymousPage';
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  const isProtected = Component.isProtected;
  const isAnonymous = Component.isAnonymous;

  if (isProtected && isAnonymous) {
    throw new Error(
        `The component ${Component.name} is anonymous and protected as the same time. Please choose either one`
    );
  }

  return (
      <Layout>
        <Head>
          <title>{Component.name} | CS IA</title>
        </Head>
        {isProtected ? (
            <ProtectedPage>
              <Component {...pageProps} />
            </ProtectedPage>
        ) : isAnonymous ? (
            <AnonymousPage>
              <Component {...pageProps} />
            </AnonymousPage>
        ) : (
            <Component {...pageProps} />
        )}
      </Layout>
  );
}

// Add just so IDE doesn't complain :)
MyApp.isProtected = false;
MyApp.isAnonymous = false;

export default MyApp;