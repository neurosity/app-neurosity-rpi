import React from "react";

import { SSVEP } from "../../components/notion/VisualStimuli/SSVEP";
import { VisualStimuli } from "../../components/notion/VisualStimuli/VisualStimuli";
import { MathEquations } from "../../components/notion/MentalMath/MathEquations";
import { testHasUserClaim } from "./testHasUserClaim";
import { notion } from "../../services/notion";
import { customRecordingTest } from "./customRecordingTest";
import { customExternalTrigger } from "./customExternalTrigger";
import { PlayTone } from "./PlayTone";

export function getTestsList({ userClaims }) {
  return [
    customExternalTrigger,
    customRecordingTest,
    {
      name: "10 Minutes of Eyes Closed",
      experimentId: "eyes-closed",
      recordData: true,
      instructions: [
        {
          description:
            "Close your eyes when you hear the tone in 5 seconds. Open your eyes in 10 minutes after the second tone plays.",
          duration: 5000,
          component: function () {
            return <div> Get Ready.</div>;
          },
        },
        {
          description: "Close your eyes",
          duration: 60 * 10 * 1000, // 10 minutes
          component: function () {
            notion.addMarker("eyes-closed");

            return (
              <div>
                {" "}
                Close Your Eyes.
                <PlayTone />
              </div>
            );
          },
        },
        {
          description: "Open your eyes",
          duration: 5000,
          component: function () {
            notion.addMarker("eyes-opened");

            return (
              <div>
                {" "}
                Eyes closed test completed!
                <PlayTone />
              </div>
            );
          },
        },
      ],
    },
    {
      name: "Alpha Resting State",
      experimentId: "alpha-resting-state",
      recordData: true,
      instructions: [
        {
          description:
            "Complete as many of the equations in 30 seconds as possible.",
          duration: 30000, //this needs to be changed to 30000
          component: function () {
            return <MathEquations />;
          },
        },
        {
          description:
            "After the tone plays breathe in time with the image and still your mind.",
          duration: 3500, //this needs to be changed to 33500
          component: function () {
            return <div></div>;
          },
        },
        {
          description: "Breathe deeply. Focus gently on the breath.",
          duration: 30000, //this needs to be changed to 30000
          component: function () {
            return (
              <div>
                <img src="../../assets/gifs/inhale-exhale.gif" alt="Exhale" />
              </div>
            );
          },
        },
      ],
    },
    {
      name: "Alpha Reactive State",
      experimentId: "alpha-reactive-state",
      recordData: true,
      instructions: [
        {
          description:
            "A tone will play every 20 seconds. At the first tone close your eyes, then alternate opening and closing your eyes.",
          duration: 3000,
          component: function () {
            return <div> Get Ready.</div>;
          },
        },
        {
          description: "Close your eyes",
          duration: 20000,
          component: function () {
            return (
              <div>
                {" "}
                Close Your Eyes.
                <PlayTone />
              </div>
            );
          },
        },
        {
          description: "Open your eyes",
          duration: 20000, //this needs to change to
          component: function () {
            return (
              <div>
                {" "}
                Are you wearing socks?
                <PlayTone />
              </div>
            );
          },
        },
        {
          description: "Close your eyes",
          duration: 20000, //this needs to be
          component: function () {
            return (
              <div>
                {" "}
                Close Your Eyes
                <PlayTone />
              </div>
            );
          },
        },
        {
          description: "Watch the image",
          duration: 20000, //this needs to be
          component: function () {
            return (
              <div>
                <img src="../../assets/gifs/baseline4.gif" alt="Baseline" />
                <PlayTone />
              </div>
            );
          },
        },
        {
          description: "Close your eyes",
          duration: 20000, //this needs to be
          component: function () {
            return (
              <div>
                {" "}
                Close Your Eyes
                <PlayTone />
              </div>
            );
          },
        },
        {
          description: "Open your eyes",
          duration: 3000,
          component: function () {
            return (
              <div>
                {" "}
                Experiment Completed!
                <PlayTone />
              </div>
            );
          },
        },
      ],
    },
    {
      name: "Visual Evoked Potential Spike",
      experimentId: "visual-evoked-potential",
      recordData: true,
      instructions: [
        {
          description:
            "Neurons in visual cortex respond to visual stimuli. \n For the first 60 seconds shapes will appear randomly. \n Keep looking at the screen throughout that time. \n To start the experiment click “Start”",
          duration: 60000,
          component: function () {
            return (
              <VisualStimuli
                sampleSize={40}
                baselinePeriod={5000}
                minWaitPeriod={800}
                maxWaitPeriod={1200}
                onVisualStimuli={(label) => {
                  notion.addMarker(label);
                }}
              />
            );
          },
        },
      ],
    },
    {
      name: "Steady State Visual Evoked Potential",
      experimentId: "ssvep",
      recordData: true,
      instructions: [
        {
          description:
            "A light will flicker on the screen. Every 30 seconds the speed of the light will change and a cross will appear on the screen. With a relaxed gaze, watch the light flicker and refocus on the cross when it begins.\n To start the experiment, click “Start”.",
          duration: 30000, //this needs to be changed to 30000
          component: function () {
            return <SSVEP duration={30000} frequencies={[10, 15]} />;
          },
        },
      ],
    },
  ].filter((test) => testHasUserClaim(test, userClaims));
}
