import { getTimer, setTimer } from "@/pages/api/db";
import React, { useState, useEffect } from "react";

const CountUpTimer = ({ onCreateTimeBlock, activity, setActivity }) => {
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActiveState] = useState(false);
  const [startDateTime, setStartDateTimeState] = useState(null);

  const setTimerActive = async (isActive) => {
    await setTimer({ 
      name: 'count-up-timer',
      isActive,
      activity,
    });
    setTimerActiveState(isActive);
  }

  const setStartDateTime = async (value) => {
    await setTimer({
      name: 'count-up-timer',
      start: Math.floor(value / 1000),
    });
    setStartDateTimeState(value);
  }

  useEffect(() => {
    const fetchTimerFromDB = async () => {
      const timer = await getTimer({ name: 'count-up-timer' });
      if (timer) {
        const sd = timer.start * 1000;
        if (timer.isActive) {
          setActivity(timer.activity.toString());
          setStartDateTimeState(sd);
          setTimerActiveState(true);
          setElapsed(Math.floor((Date.now() - sd) / 1000));
        }
      }
    }
    fetchTimerFromDB();
  });

  useEffect(() => {
    if (timerActive) {
      const timerId = setTimeout(() => setElapsed(elapsed + 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timerActive, elapsed]);
  
  useEffect(() => {
    (async () => {
      if (!(await getTimer({ name: 'count-up-timer' })).isActive && timerActive) {
          setTimerActive(false);
      }
    })();
  }, [elapsed]);

  const handleStart = async () => {
    await setStartDateTime(Date.now());
    await setTimerActive(true);
  };

  const handleStop = async() => {
    if ((await getTimer({ name: 'count-up-timer' })).isActive) {
      await setTimerActive(false);
      const endDateTime = Date.now();
      onCreateTimeBlock({ 
        startDateTime,
        endDateTime,
        spentOn: activity 
      });
    } else {
      setTimerActiveState(false);
    }
  };

  const handleClear = () => {
    setElapsed(0);
  }

  return (
    <div>
      <div style={{ fontSize: '30pt' }}>{Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}</div>
      <p>
        <button disabled={timerActive || !activity} onClick={handleStart}>Start</button>
        <button disabled={!timerActive} onClick={handleStop}>Stop</button>
        <button onClick={handleClear}>Clear</button>
        <button onClick={() => location.reload()}>Refresh</button>
      </p>
    </div>
  );
};

export default CountUpTimer;