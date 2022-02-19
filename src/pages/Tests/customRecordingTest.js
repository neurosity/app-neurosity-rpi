import React, { useState, useEffect } from "react";
import ReactSelect from "react-select";
import styled from "styled-components";

import { playTone } from "./PlayTone";

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

const labels = ["eyes-closed", "eyes-open", "resting", "erp", "oddball"].map(
  (label) => ({
    value: label,
    label,
  })
);

export const customRecordingTest = {
  name: "Custom Recording",
  experimentId: "custom-recording",
  recordData: true,
  onFinish: async () => {
    playTone();
    return null;
  },
  settings: function CustomRecordingSettings({
    status,
    setInstructionsSettings,
  }) {
    const [selectedLength, setSelectedLength] = useState(lengths[0]);
    const [selectedLabel, setSelectedLabel] = useState(labels[0]);

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
        label: selectedLabel.value,
      }));
    }, [setInstructionsSettings, selectedLabel]);

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
              <label className="control-label">Label</label>
              <Select
                placeholder="Label"
                value={selectedLabel}
                onChange={(option) => setSelectedLabel(option)}
                isDisabled={status !== "ready"}
                isMulti={false}
                options={labels}
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
      description: `Configure the recording and click “Start”. You'll hear a sound when the recording is complete.`,
      duration: instructionsSettings.length,
      component: function ({ instructionsSettings }) {
        return (
          <div>
            Recording {instructionsSettings.lengthLabel} of data labeled as "
            {instructionsSettings.label}".
          </div>
        );
      },
    },
  ],
};
