
import React from 'react';
import { Parallax } from 'react-scroll-parallax';

const ParallaxComponent: React.FC = () => {
  return (
    <div style={{ zIndex: -1, position: 'relative' }}>
      <Parallax translateY={[-20, 20]}>
        <img src="/philip-oroni-Kkg2viCy5vs-unsplash.jpg" alt="background" />
      </Parallax>
    </div>
  );
};

export default ParallaxComponent;
