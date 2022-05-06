import React from 'react';
import { Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { counterSlice } from '../../store/reducers/testSlice';

function Main() {
  const { count } = useAppSelector((state) => state.testSlice);
  const dispatch = useAppDispatch();

  const handleIncrement = () => {
    dispatch(counterSlice.actions.increment());
  };

  const handleDecrement = () => {
    dispatch(counterSlice.actions.decrement());
  };

  return (
    <div className="App" style={{ height: '110vh' }}>
      <h1>The quick brown fox jumps over the lazy dog.</h1>
      <h2>The quick brown fox jumps over the lazy dog.</h2>
      <div>{count}</div>
      <Button variant="contained" color="secondary" onClick={handleIncrement}>
        +
      </Button>
      <Button variant="contained" color="secondary" onClick={handleDecrement}>
        -
      </Button>
    </div>
  );
}

export default Main;
