import { deleteTimeBlock, upsertTimeBlock } from '@/pages/api/db';
import { parseDurationMinutes, unparseDurationMinutes } from '@/utils/duration';
import React, { useState } from 'react';

const getMinutes = (dateTime) => {
  return (new Date(dateTime)).getMinutes();
}

const getHours = (dateTime) => {
  return (new Date(dateTime)).getHours();
}


const TimeForm = ({ onDataChange, timeBlock }) => {
  const [startTimeHour, setStartTimeHour] = useState(getHours(timeBlock.startDateTime));
  const [startTimeMinute, setStartTimeMinute] = useState(getMinutes(timeBlock.startDateTime));
  const [endTimeHour, setEndTimeHour] = useState(getHours(timeBlock.endDateTime));
  const [endTimeMinute, setEndTimeMinute] = useState(getMinutes(timeBlock.endDateTime));
  const [spentOn, setSpentOn] = useState(timeBlock.spentOn);
  const [durationBorderColor, setDurationBorderColor] = useState(null);
  const [duration, setDuration] = useState(unparseDurationMinutes((timeBlock.endDateTime - timeBlock.startDateTime) / 1000 / 60));
  const [memo, setMemo] = useState(timeBlock.memo || '');

  const originalStartDateTime = new Date(timeBlock.startDateTime);

  const newStartDateTime = new Date(
    originalStartDateTime.getFullYear(),
    originalStartDateTime.getMonth(),
    originalStartDateTime.getDate(),
    startTimeHour,
    startTimeMinute);

  const newEndDateTime = new Date(
    originalStartDateTime.getFullYear(),
    originalStartDateTime.getMonth(),
    originalStartDateTime.getDate(),
    endTimeHour,
    endTimeMinute);

  const durationMinutes = (newEndDateTime.getTime() - newStartDateTime.getTime()) / 1000 / 60;

  const setDurationMinutes = (miutes) => {
    const newEndDateTime = new Date(newStartDateTime.getTime() + miutes * 60 * 1000);
    setEndTimeHour(newEndDateTime.getHours());
    setEndTimeMinute(newEndDateTime.getMinutes());
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newEndDateTime < newStartDateTime) {
      alert('End time must be after start time');
      return;
    }

    const newTimeBlock = {
      ...timeBlock,
      startDateTime: newStartDateTime.getTime(),
      endDateTime: newEndDateTime.getTime(),
      spentOn,
      memo,
    };

    await upsertTimeBlock(newTimeBlock);
    onDataChange();
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    await deleteTimeBlock(timeBlock);
    onDataChange();
  };

  const handleCopy = async (e) => {
    e.preventDefault();
    const duration = timeBlock.endDateTime - timeBlock.startDateTime;

    const copied = {
      startDateTime: timeBlock.endDateTime + 15 * 60 * 1000,
      endDateTime: timeBlock.endDateTime + duration + 15 * 60 * 1000,
      spentOn,
    };

    await upsertTimeBlock(copied);
    onDataChange();
  };

  return (
    <div style={{
      padding: '7px',
      border: '1px solid #000',
      borderRadius: '5px',
      lineHeight: '1.5',
    }}>
      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <label>
              From
              <input
                type="number"
                min="0"
                max="23"
                value={startTimeHour}
                onChange={(event) => setStartTimeHour(event.target.value)}
                style={{ marginLeft: '5px', width: '60px' }}
              />
              :
              <input
                type="number"
                min="0"
                max="59"
                value={startTimeMinute}
                onChange={(event) => setStartTimeMinute(event.target.value)}
                style={{ marginLeft: '5px', width: '60px' }}
              />
            </label>
            <label  style={{ marginLeft: '5px' }}>
              To
              <input
                type="number"
                min="0"
                max="23"
                value={endTimeHour}
                onChange={(event) => setEndTimeHour(event.target.value)}
                style={{ marginLeft: '5px', width: '60px' }}
              />
              :
              <input
                type="number"
                min="0"
                max="59"
                value={endTimeMinute}
                onChange={(event) => setEndTimeMinute(event.target.value)}
                style={{ marginLeft: '5px', width: '60px' }}
              />
            </label>
            <label style={{ marginLeft: '5px' }}>
              Length
              <input
                type="string"
                value={duration}
                onChange={(event) => {
                  setDuration(event.target.value);
                  try {
                    setDurationMinutes(parseDurationMinutes(event.target.value));
                    setDurationBorderColor(null);
                  } catch (e) {
                    console.log(e);
                    setDurationBorderColor('red');
                  }
                }}
                style={{ marginLeft: '5px', width: '60px', borderColor: durationBorderColor, outlineColor: durationBorderColor }}
              />
            </label>
          </div>
          <div style={{ marginTop: '10px', width: '100%'}}>
          <label>
            Title
            <input
              type="text"
              value={spentOn}
              onChange={(event) => setSpentOn(event.target.value)}
              style={{ marginLeft: '5px' }}
            />
            <div  style={{ marginTop: '10px', width: '100%'}}>
            <textarea onChange={e => setMemo(e.target.value)} value={memo} style={{ width: '95%', maxWidth: '95%'}}></textarea>
            </div>
          </label>
          </div>
        </div>
        <div style={{
          textAlign: 'right',
        }}>
          <button type="button" style={{ marginRight: '5px', backgroundColor: '#ffcccc' }} onClick={handleDelete}>Delete</button>
          <button type="button" style={{ marginRight: '5px', backgroundColor: '#ffffcc' }} onClick={handleCopy}>Copy</button>
          <button type="button" style={{ marginRight: '5px', backgroundColor: '#cccccc' }} onClick={onDataChange}>Cancel</button>
          <button type="submit" style={{ marginRight: '0px', backgroundColor: '#ccffcc' }}>Submit</button>
        </div>
      </form>
    </div>
  );
};

export default TimeForm;