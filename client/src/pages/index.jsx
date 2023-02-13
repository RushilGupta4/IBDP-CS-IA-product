import React from 'react';
import { useSpring, animated, config } from 'react-spring';
import styles from '../styles/Home.module.scss';

function Home() {
  const animationStyle = useSpring({
    config: config.gentle,
    from: { opacity: 0, transform: 'translate(-50%, -100%)' },
    to: { opacity: 1, transform: 'translate(-50%, -50%)' },
  });

  return (
    <animated.p className={styles.header} style={animationStyle}>
      CSIA
    </animated.p>
  );
}

export default Home;
