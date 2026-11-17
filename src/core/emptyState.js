// Why is a card empty, and what should the user do next? Pure so it can be tested;
// src/ui/emptyState.js turns the result into DOM.

import { hasRealTbaKey } from "../data/tba.js";

/**
 * @param {"matches"|"teamMatches"|"noUpcoming"|"rankings"|"webcasts"} kind
 * @param {{tbaKey?: string, online?: boolean, hasEvent?: boolean, teamNumber?: string|number}} ctx
 * @returns {{reason: string, title: string, body: string, action: "settings"|null}}
 */
export function describeEmpty(kind, { tbaKey = "", online = true, hasEvent = false, teamNumber = "" } = {}) {
  if (!hasRealTbaKey({ tbaapikey: tbaKey })) {
    return {
      reason: "no-key",
      title: "Add your TBA key to get started",
      body: "PitBeacon loads matches and rankings from The Blue Alliance. Paste a read key from thebluealliance.com/account in Settings.",
      action: "settings",
    };
  }
  if (!online) {
    return {
      reason: "offline",
      title: "You're offline",
      body: "Nothing saved on this device yet. Reconnect and this card fills in on its own.",
      action: null,
    };
  }
  if (!hasEvent) {
    return {
      reason: "no-event",
      title: `No event found for team ${teamNumber || "your team"}`,
      body: "Cards fill in once your team's event is running. Check the team number in Settings, or use Test Mode with a past event date to preview.",
      action: "settings",
    };
  }
  switch (kind) {
    case "teamMatches":
      return {
        reason: "no-team-matches",
        title: `No matches for team ${teamNumber} yet`,
        body: "The schedule is usually posted shortly before qualifications start. This updates automatically.",
        action: null,
      };
    case "noUpcoming":
      return {
        reason: "no-upcoming",
        title: "No more matches scheduled",
        body: `That's all of team ${teamNumber}'s scheduled matches. Playoff matches show up here once your alliance is selected.`,
        action: null,
      };
    case "rankings":
      return {
        reason: "no-rankings",
        title: "Rankings aren't out yet",
        body: "They appear after the first qualification matches are played.",
        action: null,
      };
    case "webcasts":
      return {
        reason: "no-webcasts",
        title: "No webcast today",
        body: "This event hasn't listed a stream for today. Check the event page on The Blue Alliance.",
        action: null,
      };
    default:
      return {
        reason: "no-matches",
        title: "No matches posted yet",
        body: "The schedule appears once the event publishes it. This updates automatically.",
        action: null,
      };
  }
}
