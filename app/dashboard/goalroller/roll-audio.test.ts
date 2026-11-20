import { describe, expect, it, vi } from "vitest";

import { playGoalrollerSound, stopGoalrollerSound } from "./roll-audio";

describe("GoalRoller roll sound", () => {
  it("restarts the same audio element for a new roll", () => {
    const audio = {
      currentTime: 1.4,
      pause: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
    };

    playGoalrollerSound(audio);

    expect(audio.pause).toHaveBeenCalledOnce();
    expect(audio.currentTime).toBe(0);
    expect(audio.play).toHaveBeenCalledOnce();
  });

  it("pauses and rewinds immediately when the roll ends", () => {
    const audio = {
      currentTime: 2.7,
      pause: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
    };

    stopGoalrollerSound(audio);

    expect(audio.pause).toHaveBeenCalledOnce();
    expect(audio.currentTime).toBe(0);
  });
});
