import React, { useState, useEffect, useCallback, useMemo } from "react";
import { navigate } from "@reach/router";
import styled from "styled-components";
import { timer } from "rxjs";
import anonymus from "anonymus";

import { getTestsList } from "./testsList";
import SignalQuality from "../../components/notion/SignalQuality/SignalQualityCard";

import { notion, useNotion, deviceApp } from "../../services/notion";
import { Nav } from "../../components/Nav";

const RightContainer = styled.div`
  border: 1px solid darkgray;
  height: 300px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 21px;

  & img {
    height: 298px !important;
    width: auto !important;
  }
`;

const TestLabel = styled.span.attrs({
  className: "label label-default",
})`
  position: relative;
  left: 10px;
  top: -5px;
  padding: 4px 9px;
  border-radius: 4px;
`;

const Content = styled.div`
  & .card {
    min-height: 171px;
    margin-bottom: 0;
  }
`;

export function Tests() {
  const { status, selectedDevice, userClaims, user } = useNotion();
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);
  const tests = useMemo(
    () => getTestsList({ selectedDevice, userClaims }),
    [selectedDevice, userClaims]
  );
  const { sleepMode } = status || {};

  return (
    <Content className="content">
      <div className="container-fluid">
        <div className="col-md-6">
          {user ? <Nav /> : null}
          <SignalQuality />
        </div>
        <div className="col-md-6">
          <h2>Tests</h2>
          {tests.map((test) => (
            <Test key={test.name} test={test} sleepMode={sleepMode} />
          ))}
        </div>
      </div>
    </Content>
  );
}

function Test({ test, sleepMode }) {
  const [passed, setPassed] = useState(null);
  const [status, setStatus] = useState("ready");
  const [activeInstruction, setActiveInstruction] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [instructionsState, setInstructionsState] = useState({});
  const [instructionsSettings, setInstructionsSettings] = useState({});

  const [instructions, testDuration] = useMemo(() => {
    const instructions =
      typeof test.instructions === "function"
        ? test.instructions(instructionsSettings)
        : test.instructions;

    const testDuration = instructions.reduce(
      (acc, { duration }) => acc + duration,
      0
    );

    const mappedInstructions = instructions.map((instruction, i) => ({
      ...instruction,
      id: i,
    }));

    return [mappedInstructions, testDuration];
  }, [instructionsSettings]);

  const stop = useCallback(() => {
    setStatus("completed");
    setActiveInstruction(null);
  }, []);

  // on complete test
  useEffect(() => {
    if (status !== "completed") {
      return;
    }

    if (test.experimentId === "signal-quality") {
      setTesting(true);
    } else if ("onFinish" in test) {
      setTesting(true);
      test.onFinish(instructionsState).then((passed) => {
        setTesting(false);
        setPassed(passed);
      });
    } else {
      setPassed(true);
    }
  }, [status, instructionsState, test, setTesting, setPassed]);

  useEffect(() => {
    if (!activeInstruction) {
      return;
    }

    const isLastInstruction =
      activeInstruction.id === instructions[instructions.length - 1].id;

    timer(activeInstruction.duration).subscribe(() => {
      if (isLastInstruction) {
        stop();
      } else {
        const currentInstructionIndex = instructions.findIndex(
          (instruction) => instruction.id === activeInstruction.id
        );
        setActiveInstruction(instructions[currentInstructionIndex + 1]);
      }
    });
  }, [activeInstruction, setActiveInstruction, instructions, stop]);

  const start = useCallback(async () => {
    setStatus("started");
    setActiveInstruction(instructions[0]);

    if (!test.recordData) {
      return;
    }

    const memory = await notion.dispatchAction({
      command: "brainwaves",
      action: "record",
      responseRequired: true,
      responseTimeout: testDuration + 10000,
      message: {
        name: anonymus.create(),
        experimentId: test.experimentId,
        label: instructionsSettings?.label ?? test.experimentId,
        duration: testDuration,
      },
    });

    if (test.experimentId === "external-trigger") {
    }
  }, [setStatus, test, setActiveInstruction, instructionsSettings]);

  const reset = useCallback(() => {
    setPassed(null);
    setStatus("ready");
    setActiveInstruction(null);
    setTesting(false);
    setTestResults(null);
  }, [setPassed, setStatus, setActiveInstruction, setTesting, setTestResults]);

  return (
    <div className="card">
      <header className="card-header">
        <h3>
          {test.name}
          {test?.isInternal ? <TestLabel>Internal</TestLabel> : null}
        </h3>
      </header>
      <div className="card-content">
        <div className="row">
          <div className="col-md-6">
            {test?.settings ? (
              <test.settings
                status={status}
                setInstructionsSettings={setInstructionsSettings}
              />
            ) : null}
            {instructions.map((instruction, index) => (
              <p key={instruction.id}>
                {activeInstruction &&
                instruction.id === activeInstruction.id ? (
                  <strong>
                    {index + 1}) {instruction.description}
                  </strong>
                ) : (
                  <span>
                    {index + 1}) {instruction.description}
                  </span>
                )}
              </p>
            ))}
          </div>
          <div className="col-md-6">
            <RightContainer>
              {activeInstruction ? (
                <activeInstruction.component
                  setInstructionsState={setInstructionsState}
                  instructionsSettings={instructionsSettings}
                />
              ) : null}
            </RightContainer>
          </div>
        </div>
        <div className="row">
          <div className="col-md-10">
            <button
              onClick={() => start()}
              className="btn btn-default btn-md"
              disabled={status !== "ready" || (status === "ready" && sleepMode)}
            >
              {sleepMode ? "Device in Sleep Mode" : null}
              {!sleepMode && status === "ready" ? "Start" : null}
              {!sleepMode && status === "started" ? "In progress" : null}
              {!sleepMode && status === "completed" ? "Completed" : null}
            </button>
            &nbsp;
            {status === "completed" ? (
              <button
                onClick={() => reset()}
                className="btn btn-default btn-md"
              >
                Reset
              </button>
            ) : null}
          </div>
          <div className="col-md-2">
            {testing ? (
              <span
                style={{ marginTop: "20px" }}
                className="pull-right label label-default"
              >
                Testing...
              </span>
            ) : null}
            {passed === null ? null : (
              <span
                style={{ marginTop: "20px" }}
                className={`pull-right label label-${
                  passed === true ? "info" : "warning"
                }`}
              >
                {passed ? "Passed" : "failed"}
              </span>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            {testResults ? (
              <>
                <br />
                <pre>{JSON.stringify(testResults, null, 2)}</pre>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
