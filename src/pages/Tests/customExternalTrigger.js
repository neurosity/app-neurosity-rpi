import React, { useState, useEffect } from "react";
import ReactSelect from "react-select";
import styled from "styled-components";
import { playTone } from "./PlayTone";
import { notion } from "../../services/notion";

const Select = styled(ReactSelect)`
  width: 100%;
  margin-top: 7px;
  display: inline-block;
  position: relative;
  z-index: 1;
`;

function getLength(minutes) {
  return {
    value: 60 * minutes * 1000,
    label: `${minutes} minute${minutes === 1 ? "" : "s"}`,
  };
}

// 1 - 10 minute options
const oneThroughTen = Array.from({ length: 10 }, (_, i) => i + 1);
const lengths = [...oneThroughTen, 30].map((i) => getLength(i));
const gpioPins = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27,
].map((label) => ({
  value: label,
  label,
}));
const gpioEdgeDetectDirections = ["falling", "rising", "both"].map((label) => ({
  value: label,
  label,
}));
let interruptGPIO = null;

export const customExternalTrigger = {
  name: "Custom Recording with External Trigger",
  experimentId: "custom-external-trigger",
  recordData: true,
  onFinish: async () => {
    playTone();
    if (interruptGPIO) {
      interruptGPIO.unexport();
      interruptGPIO = null;
    }
    return null;
  },
  settings: function CustomExternalTriggerSettings({
    status,
    setInstructionsSettings,
  }) {
    const [selectedLength, setSelectedLength] = useState(lengths[0]);
    const [selectedEdgeDetectDirection, setSelectedEdgeDetectDirection] =
      useState(gpioEdgeDetectDirections[0]);
    const [selectedGpioPin, setSelectedGpioPin] = useState(gpioPins[0]);

    useEffect(() => {
      setInstructionsSettings((prevState) => ({
        ...prevState,
        length: selectedLength.value,
        lengthLabel: selectedLength.label,
      }));
    }, [setInstructionsSettings, selectedLength]);

    useEffect(() => {
      setInstructionsSettings((prevState) => ({
        ...prevState,
        gpioEdgeDetectDirection: selectedEdgeDetectDirection.value,
      }));
    }, [setInstructionsSettings, selectedEdgeDetectDirection]);

    useEffect(() => {
      setInstructionsSettings((prevState) => ({
        ...prevState,
        gpioPin: selectedGpioPin.value,
      }));
    }, [setInstructionsSettings, selectedGpioPin]);

    return (
      <>
        <div className="row">
          <div className="col-md-12 col-lg-4">
            <div className="form-group label-floating">
              <label className="control-label">Length</label>
              <Select
                placeholder="Recording Length"
                value={selectedLength}
                onChange={(option) => setSelectedLength(option)}
                isDisabled={status !== "ready"}
                isMulti={false}
                options={lengths}
              />
            </div>
          </div>
          <div className="col-md-12 col-lg-4">
            <div className="form-group label-floating">
              <label className="control-label">Edge Detect Direction</label>
              <Select
                placeholder="Label"
                value={selectedEdgeDetectDirection}
                onChange={(option) => setSelectedEdgeDetectDirection(option)}
                isDisabled={status !== "ready"}
                isMulti={false}
                options={gpioEdgeDetectDirections}
              />
            </div>
          </div>
          <div className="col-md-12 col-lg-4">
            <div className="form-group label-floating">
              <label className="control-label">GPIO MODE_RPI</label>
              <Select
                placeholder="GPIO"
                value={selectedGpioPin}
                onChange={(option) => setSelectedGpioPin(option)}
                isDisabled={status !== "ready"}
                isMulti={false}
                options={gpioPins}
              />
            </div>
          </div>
        </div>
        <hr />
      </>
    );
  },
  instructions: (instructionsSettings) => [
    {
      description: `Configure the recording, GPIO edge detection, GPIO pin, and click “Start”. You'll hear a sound when the recording is complete.`,
      duration: instructionsSettings.length,
      component: function ({ instructionsSettings }) {
        const { gpioEdgeDetectDirection, gpioPin } = instructionsSettings;
        const ws = new WebSocket("ws://localhost:9898/");
        ws.onopen = function () {
          console.log("WebSocket Client Connected");
          const payload = {
            action: "setup",
            command: "gpio",
            message: { ...instructionsSettings },
          };
          ws.send(JSON.stringify(payload));
        };
        ws.onmessage = function (e) {
          console.log("Received: '" + e.data + "'");
        };

        return (
          <div>
            Recording {instructionsSettings.lengthLabel} of data labeled as
            "gpio-{gpioEdgeDetectDirection}-{gpioPin}".
          </div>
        );
      },
    },
  ],
};
