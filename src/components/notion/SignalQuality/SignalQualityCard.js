import React, { useState, useEffect } from "react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import moment from "moment";
import { Flex } from "reflexbox";

import "react-circular-progressbar/dist/styles.css";

import { notion, useNotion } from "../../../services/notion";
import {
  signalQualityScore,
  poorSignalQualityScoreThreshold,
} from "../../../services/signalQuality";
import { usePausableObservable } from "../../../services/metrics";

export default function ChannelAnalysis() {
  const { status: deviceStatus, selectedDevice } = useNotion();
  const { sleepMode } = deviceStatus || {};
  const [state, setState] = useState({
    status: "ready",
  });
  const { status } = state;

  const [score, setScore] = usePausableObservable({
    observableGetter: () => notion.signalQuality().pipe(signalQualityScore()),
    status,
  });

  const isGoodScore = score > poorSignalQualityScoreThreshold;

  useEffect(() => {
    if (sleepMode) {
      stop();
    }
  }, [sleepMode]);

  function start() {
    setState((state) => ({
      ...state,
      status: "started",
      startTime: moment(),
      completedTime: null,
    }));
  }

  function stop() {
    setState((state) => ({
      ...state,
      status: "ready",
      completedTime: moment().diff(state.startTime),
      startTime: null,
    }));
    setScore(null);
  }

  return (
    <div className="card">
      <div className="card-header">
        <h4>Signal Quality</h4>
      </div>
      <Flex className="card-content" justifyContent="center" mb="10px">
        <Flex width="180px" height="180px">
          <CircularProgressbarWithChildren
            value={score}
            maxValue={1}
            styles={buildStyles({
              pathTransition: "stroke-dashoffset 1s ease 0s",
              pathTransitionDuration: 1,
              trailColor: "rgba(0,0,0,0.06)",
              pathColor: !score
                ? "lightgray"
                : isGoodScore
                ? "limegreen"
                : "gold",
            })}
          >
            <ProgressText
              score={Math.min(Number((score * 100).toFixed(2)), 100)}
              label={isGoodScore ? "Great" : "Adjust"}
            />
          </CircularProgressbarWithChildren>
        </Flex>
      </Flex>
      {status === "started" && (
        <div className="card-footer">
          <button className="btn btn-default btn-sm" onClick={stop}>
            Stop
          </button>
        </div>
      )}
      {status === "ready" && (
        <div className="card-footer">
          <button
            className="btn btn-default btn-sm"
            disabled={sleepMode}
            onClick={start}
          >
            Start
          </button>
        </div>
      )}
    </div>
  );
}

function ProgressText({ score, label }) {
  if (!score) {
    return null;
  }

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "25px", fontWeight: 600, marginBottom: 2 }}>
        {score}%
      </div>
      {label}
    </div>
  );
}
