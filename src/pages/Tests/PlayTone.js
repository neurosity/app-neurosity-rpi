import React from "react";

const toneUrl = "../../assets/audio/single_tone.mp3";

export const tone = new Audio(toneUrl);

export function PlayTone() {
  return (
    <audio autoPlay>
      <source src={toneUrl} type="audio/mp3" />
    </audio>
  );
}

export function playTone() {
  tone.play();
}
