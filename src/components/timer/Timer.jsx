import React, { useEffect, useState } from "react";
import TimeEntryForm from "./TimeEntryForm";
import CountdownTimer from "./CountdownTimer";
import CountUpTimer from "./CountUpTimer";
import TimeBlockList from "./TimeBlockList";
import { deleteTimeBlock, listTimeBlocks, upsertTimeBlock } from "@/pages/api/db";
import NoSSR from "../NoSSR";

function Timer() {
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [timerMode, setTimerModeState] = useState(window.localStorage.getItem("timerMode") || "countup");
  const [activity, setActivity] = useState("");

  const loadTimeBlocks = async () => {
    const timeBlocks = await listTimeBlocks(Date.now() - 1000 * 60 * 60 * 24, Date.now());
    timeBlocks.sort((a, b) => b.startDateTime - a.startDateTime);
    setTimeBlocks(timeBlocks);
  };

  const setTimerMode = (newMode) => {
    setTimerModeState(newMode);
    window.localStorage.setItem("timerMode", newMode);
  };

  const dTimeBlock = async (timeBlock) => {
    await deleteTimeBlock(timeBlock);
    await loadTimeBlocks();
  }

  const handleTimeBlockCreation = async (timeBlock) => {
    await upsertTimeBlock(timeBlock);
    await loadTimeBlocks();
  };

  const handleModeChange = (newMode) => {
    setTimerMode(newMode);
  };

  const handleActivityChange = (newActivity) => {
    setActivity(newActivity);
  };

  useEffect(() => {
    loadTimeBlocks();
  }, []);

  return (
    <div
        className="App"
        style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "top",
            alignItems: "center",
            height: "100%",
            textAlign: "center",
            // backgroundColor: "#f5f5f5",
            borderRadius: '10px',
            border: '1px solid #000',
        }}
    >
      <NoSSR>
        <p></p>
        <TimeEntryForm
          onActivityChange={handleActivityChange}
          onModeChange={handleModeChange}
          activity={activity}
        />
        {timerMode === "countdown" ? (
          <CountdownTimer
            onCreateTimeBlock={handleTimeBlockCreation}
            activity={activity}
            setActivity={setActivity}
          />
        ) : (
          <CountUpTimer onCreateTimeBlock={handleTimeBlockCreation} activity={activity} setActivity={setActivity} />
        )}
        <TimeBlockList timeBlocks={timeBlocks} deleteTimeBlock={dTimeBlock} />
      </NoSSR>
    </div>
  );
}

export default Timer;