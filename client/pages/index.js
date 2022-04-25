import React from 'react';
import styles from '../styles/Home.module.scss';
import { useSpring, animated, config } from 'react-spring';

function Home() {
  const animationStyle = useSpring({
    config: config.gentle,
    from: { opacity: 0, transform: 'translate(-50%, -100%)' },
    to: { opacity: 1, transform: 'translate(-50%, -50%)' },
  });

  return (
      <animated.p className={styles.header} style={animationStyle}>
        CS IA
      </animated.p>
  );
}

export default Home;