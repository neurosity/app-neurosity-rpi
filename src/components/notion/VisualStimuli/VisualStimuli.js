import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { timer, range, animationFrameScheduler } from "rxjs";
import { concatMap, concat, tap } from "rxjs/operators";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
  background-color: black;
`;

const Box = styled.div`
  display: flex;
  width: 33%;
  height: 100px;
  position: relative;
  justify-content: center;
  align-items: center;
`;

const Stimuli = styled.div`
  width: 20px;
  height: 20px;
  background-color: white;
`;

export function VisualStimuli({
  sampleSize = 40,
  baselinePeriod = 5000,
  minWaitPeriod = 800,
  maxWaitPeriod = 1200,
  onVisualStimuli = () => {}
}) {
  const [boxes, setBoxes] = useState(
    Array.from({ length: 9 }, () => false)
  );

  useEffect(() => {
    timer(baselinePeriod).subscribe(() => {
      range(0, sampleSize)
        .pipe(
          concatMap(() => {
            const dynamicWait = randomNumber(
              minWaitPeriod,
              maxWaitPeriod
            );
            return timer(dynamicWait, animationFrameScheduler).pipe(
              tap(() => {
                toggleStimuli();
              }),
              concat(
                timer(250, animationFrameScheduler).pipe(
                  tap(() => {
                    resetStimuli();
                  })
                )
              )
            );
          })
        )
        .subscribe();
    });
  }, []);

  function toggleStimuli() {
    const randomIndex = randomNumber(0, boxes.length - 1);
    setBoxes(boxes => boxes.map((_, i) => i === randomIndex));
    onVisualStimuli("vep");
  }

  function resetStimuli() {
    setBoxes(boxes => boxes.map(() => false));
  }

  return (
    <Container>
      {boxes.map((isActive, i) => (
        <Box key={i}>{isActive ? <Stimuli /> : null}</Box>
      ))}
    </Container>
  );
}

function randomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
