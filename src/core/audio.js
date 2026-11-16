import alarm1 from "../assets/audio/alarm1.mp3";
import alarm2 from "../assets/audio/alarm2.mp3";
import alarm3 from "../assets/audio/alarm3.mp3";
import beep from "../assets/audio/beep.mp3";

export const audioFiles = {
  alarm1: new Audio(alarm1),
  alarm2: new Audio(alarm2),
  alarm3: new Audio(alarm3),
  beep: new Audio(beep),
};

Object.values(audioFiles).forEach((audio) => {
  audio.onerror = () => console.warn("Audio file failed to load");
});
