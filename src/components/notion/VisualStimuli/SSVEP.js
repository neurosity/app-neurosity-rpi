import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { timer, concat, animationFrameScheduler } from "rxjs";
import { map, takeUntil } from "rxjs/operators";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
  background-color: black;
  position: relative;

  &:after {
    content: " ";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-25px, -25px);
    width: 50px;
    height: 50px;
    background-color: ${({ isActive }) =>
      isActive ? "white" : "transparent"};
  }
`;

export function SSVEP({ duration = 3000, frequencies = [10] }) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const stimuli = frequencies.map(frequency =>
      createSSVEPStimulus(frequency, duration)
    );

    concat(...stimuli).subscribe(isActive => {
      setIsActive(isActive);
    });
  }, []);

  return <Container isActive={isActive} />;
}

function createSSVEPStimulus(frequency, duration = 100000) {
  const interval = 1000 / frequency / 2;
  return timer(0, interval, animationFrameScheduler).pipe(
    map(i => i % 2 === 0),
    takeUntil(timer(duration))
  );
}
