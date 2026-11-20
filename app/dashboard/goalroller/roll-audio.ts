type RollAudio = Pick<HTMLAudioElement, "pause" | "play" | "currentTime">;

export function playGoalrollerSound(audio: RollAudio | null) {
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
  void audio
    .play()
    .catch((error: unknown) =>
      console.error("[goalroller] Could not play roll sound", error),
    );
}

export function stopGoalrollerSound(audio: RollAudio | null) {
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
}
