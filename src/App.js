import { useState } from "react";

const App = () => {
  const [count, setCount] = useState(0);
  const increase = () => setCount((prevCount) => prevCount + 1);
  const decrease = () => setCount((prevCount) => prevCount - 1);
  const reset = () => setCount(0);
  return (
    <>
      <h3>Count: {count}</h3>
      <>
        <button onClick={increase}>INCREASE</button>
        <button onClick={decrease}>DECREASE</button>
        <button onClick={reset}>RESET</button>
      </>
    </>
  );
};

export default App;
