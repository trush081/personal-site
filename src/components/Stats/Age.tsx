'use client';

import { useEffect, useState } from 'react';

const DIVISOR = 1000 * 60 * 60 * 24 * 365.2421897; // ms in an average year
const BIRTH_TIME = new Date('2000-02-23T19:15:00').getTime();

const Age = () => {
  const [age, setAge] = useState<string>();

  useEffect(() => {
    const timer = setInterval(() => {
      setAge(((Date.now() - BIRTH_TIME) / DIVISOR).toFixed(11));
    }, 25);
    return () => clearInterval(timer);
  }, []);

  return <>{age}</>;
};

export default Age;
