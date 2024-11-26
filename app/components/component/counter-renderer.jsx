import { useEffect, useState } from 'react';

function Countdown({ startCount, onComplete }) {
  const [count, setCount] = useState(startCount);

  useEffect(() => {
    if (count <= 0) {
      onComplete(); // Call the passed function when the countdown is complete
      return;
    }

    const timer = setInterval(() => {
      setCount(prevCount => prevCount - 1);
    }, 1000);

    // Cleanup the interval on component unmount or when the count changes
    return () => clearInterval(timer);
  }, [count, onComplete]);

  return count;
}

export default Countdown;