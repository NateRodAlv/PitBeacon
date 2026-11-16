import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataSourceManager, isEventActive } from "../src/data/sources.js";
import { StateManager } from "../src/core/state.js";

const event = { key: "2027mitry", start_date: "2027-03-12", end_date: "2027-03-14", name: "Test" };

function json(body, { status = 200, etag = null } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => (name.toLowerCase() === "etag" ? etag : null) },
    json: async () => body,
  };
}

describe("isEventActive", () => {
  it("covers the whole last day of the event", () => {
    expect(isEventActive(event, new Date(2027, 2, 14, 15, 30))).toBe(true);
    expect(isEventActive(event, new Date(2027, 2, 14, 23, 59))).toBe(true);
  });
  it("is false before the first and after the last day", () => {
    expect(isEventActive(event, new Date(2027, 2, 11, 23, 59))).toBe(false);
    expect(isEventActive(event, new Date(2027, 2, 15, 0, 0, 1))).toBe(false);
  });
  it("ignores events without dates", () => {
    expect(isEventActive({ key: "x" }, new Date())).toBe(false);
  });
});

describe("DataSourceManager", () => {
  let state;
  let sources;
  let fetchMock;

  beforeEach(() => {
    state = new StateManager({ fullDate: new Date(2027, 2, 13, 10, 0) });
    sources = new DataSourceManager({ teamNumber: 7250, tbaapikey: "real-key" }, state);
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => vi.unstubAllGlobals());

  function route(handlers) {
    fetchMock.mockImplementation(async (url, init) => {
      for (const [pattern, handler] of handlers) {
        if (url.includes(pattern)) return handler(init);
      }
      return json(null, { status: 404 });
    });
  }

  it("queries the season of the date being shown", async () => {
    route([["/events/2027", () => json([event])]]);
    await sources.fetchAll();
    expect(fetchMock.mock.calls[0][0]).toContain("/team/frc7250/events/2027");
  });

  it("returns nothing without a real API key", async () => {
    const keyless = new DataSourceManager({ teamNumber: 7250, tbaapikey: "TBA Key" }, state);
    expect(await keyless.fetchAll()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refreshes on every round instead of serving the first response forever", async () => {
    let matches = [{ key: "m1", predicted_time: 100 }];
    route([
      ["/events/2027", () => json([event])],
      ["/matches/simple", () => json(matches)],
      ["/rankings", () => json({ rankings: [] })],
    ]);
    const first = await sources.fetchAll();
    matches = [{ key: "m1", predicted_time: 999 }];
    const second = await sources.fetchAll();
    expect(first.matches[0].predicted_time).toBe(100);
    expect(second.matches[0].predicted_time).toBe(999);
  });

  it("revalidates with the ETag and keeps the data on 304", async () => {
    let call = 0;
    route([
      ["/events/2027", () => json([event])],
      [
        "/matches/simple",
        (init) => {
          call += 1;
          if (call === 1) return json([{ key: "m1" }], { etag: '"abc"' });
          expect(init.headers["If-None-Match"]).toBe('"abc"');
          return { ok: false, status: 304, headers: { get: () => null }, json: async () => null };
        },
      ],
      ["/rankings", () => json({ rankings: [] })],
    ]);
    await sources.fetchAll();
    const second = await sources.fetchAll();
    expect(second.matches).toEqual([{ key: "m1" }]);
    expect(second.stale).toBe(false);
  });

  it("falls back to the last good data and flags it stale when the network fails", async () => {
    route([
      ["/events/2027", () => json([event])],
      ["/matches/simple", () => json([{ key: "m1" }])],
      ["/rankings", () => json({ rankings: [{ team_key: "frc7250", rank: 4 }] })],
    ]);
    await sources.fetchAll();
    fetchMock.mockImplementation(async () => {
      throw new TypeError("Failed to fetch");
    });
    const offline = await sources.fetchAll();
    expect(offline.matches).toEqual([{ key: "m1" }]);
    expect(offline.rankings[0].rank).toBe(4);
    expect(offline.stale).toBe(true);
  });

  it("builds the team summary from rankings", async () => {
    state.update({ currentEventData: event });
    route([
      ["/events/2027", () => json([event])],
      ["/status", () => json({ qual: { rank: 9, record: { wins: 1, losses: 1, ties: 0 } } })],
      [
        "/rankings",
        () => json({ rankings: [{ team_key: "frc7250", rank: 3, record: { wins: 3, losses: 1, ties: 0 } }] }),
      ],
    ]);
    const { teamSummary } = await sources.fetchTeamSummary(event.key);
    expect(teamSummary.eventRank).toBe(3);
    expect(teamSummary.winRate).toBe("75.0%");
    expect(teamSummary.seasonEventCount).toBe(1);
    expect(teamSummary.eventName).toBe("Test");
  });
});
