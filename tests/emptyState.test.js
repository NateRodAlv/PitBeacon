import { describe, expect, it } from "vitest";
import { describeEmpty } from "../src/core/emptyState.js";

const key = "abc123realkey";

describe("describeEmpty", () => {
  it("asks for a TBA key first, with a Settings action", () => {
    expect(describeEmpty("matches", { tbaKey: "YOUR_AUTH_KEY", online: false })).toMatchObject({ reason: "no-key", action: "settings" });
    expect(describeEmpty("rankings", { tbaKey: "" }).reason).toBe("no-key");
  });
  it("explains offline before anything else once a key exists", () => {
    expect(describeEmpty("matches", { tbaKey: key, online: false, hasEvent: true }).reason).toBe("offline");
  });
  it("explains a missing event and mentions the team", () => {
    const empty = describeEmpty("matches", { tbaKey: key, online: true, hasEvent: false, teamNumber: 7250 });
    expect(empty.reason).toBe("no-event");
    expect(empty.title).toContain("7250");
  });
  it("gives a per-card reason when everything else is fine", () => {
    const ctx = { tbaKey: key, online: true, hasEvent: true, teamNumber: 7250 };
    expect(describeEmpty("teamMatches", ctx).reason).toBe("no-team-matches");
    expect(describeEmpty("noUpcoming", ctx).reason).toBe("no-upcoming");
    expect(describeEmpty("rankings", ctx).reason).toBe("no-rankings");
    expect(describeEmpty("webcasts", ctx).reason).toBe("no-webcasts");
    expect(describeEmpty("matches", ctx).reason).toBe("no-matches");
  });
});
