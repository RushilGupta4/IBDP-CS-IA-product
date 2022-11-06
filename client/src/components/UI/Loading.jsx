import React from 'react';
import BoxLoading from 'react-loadingg/lib/BoxLoading';

function Loading({ style }) {
  return (
    <BoxLoading color={'#38bdf8'} size={'large'} speed={0.8} style={style} />
  );
}

export default Loading;
