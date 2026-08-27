import { beforeEach, describe, expect, it } from "vitest";
import useEventsStore, { smartMergeEvent } from "./eventsStore";

const event = (id, start, extra = {}) => ({
  id,
  Start_DateTime: start,
  Event_Title: `Event ${id}`,
  ...extra,
});

describe("events store", () => {
  beforeEach(() => {
    useEventsStore.setState({ events: [], loading: false, cache: {} });
  });

  it("merges overlapping fetches by id and keeps chronological order", () => {
    const store = useEventsStore.getState();
    store.setEvents([
      event("later", "2026-08-22T10:00:00Z"),
      event("same", "2026-08-21T10:00:00Z", { Event_Title: "Old" }),
    ]);

    store.addEvents([
      event("earlier", "2026-08-20T10:00:00Z"),
      event("same", "2026-08-21T10:00:00Z", { Event_Title: "Fresh" }),
    ]);

    expect(useEventsStore.getState().events.map(({ id }) => id)).toEqual([
      "earlier",
      "same",
      "later",
    ]);
    expect(useEventsStore.getState().events[1].Event_Title).toBe("Fresh");
  });

  it("adds a new event once and removes it by id", () => {
    const store = useEventsStore.getState();
    store.addEvent(event("b", "2026-08-22T10:00:00Z"));
    store.addEvent(event("a", "2026-08-21T10:00:00Z"));
    store.addEvent(event("a", "2026-08-21T10:00:00Z", { Event_Title: "Duplicate" }));

    expect(useEventsStore.getState().events.map(({ id }) => id)).toEqual([
      "a",
      "b",
    ]);

    store.removeEvent("a");
    expect(useEventsStore.getState().events.map(({ id }) => id)).toEqual(["b"]);
  });

  it("updates records while preserving complete owner and creator details", () => {
    useEventsStore.getState().setEvents([
      event("1", "2026-08-21T10:00:00Z", {
        Owner: { id: "u1", name: "Ada", email: "ada@example.com" },
        Created_By: { id: "u2", name: "Grace", email: "grace@example.com" },
      }),
    ]);

    useEventsStore.getState().updateEvent({
      id: "1",
      Event_Title: "Updated",
      Owner: { id: "u1" },
      Created_By: { id: "u2" },
    });

    expect(useEventsStore.getState().events[0]).toMatchObject({
      Event_Title: "Updated",
      Owner: { id: "u1", name: "Ada", email: "ada@example.com" },
      Created_By: { id: "u2", name: "Grace", email: "grace@example.com" },
    });
  });

  it("uses complete new owner data while retaining unspecified fields", () => {
    expect(
      smartMergeEvent(
        { Owner: { id: "u1", name: "Old", email: "kept@example.com" } },
        { Owner: { id: "u2", name: "New" } }
      ).Owner
    ).toEqual({ id: "u2", name: "New", email: "kept@example.com" });
  });

  it("sets, reads, updates, removes, and clears cached events", () => {
    const cached = event("1", "2026-08-21T10:00:00Z", {
      Owner: { id: "u1", name: "Ada" },
    });
    const other = event("2", "2026-08-22T10:00:00Z");
    const range = {
      start: new Date("2026-08-01T00:00:00Z"),
      end: new Date("2026-08-31T23:59:59Z"),
    };

    const store = useEventsStore.getState();
    store.setCache("Current Month", [cached, other], range);
    expect(useEventsStore.getState().getCache("Current Month")).toEqual({
      data: [cached, other],
      range,
    });
    expect(useEventsStore.getState().getCache("missing")).toBeNull();

    useEventsStore.getState().updateCacheEntry({
      id: "1",
      Event_Title: "Cached update",
      Owner: { id: "u1" },
    });
    expect(
      useEventsStore.getState().cache["Current Month"].data[0]
    ).toMatchObject({
      Event_Title: "Cached update",
      Owner: { id: "u1", name: "Ada" },
    });

    useEventsStore.getState().removeEventFromCache("1");
    expect(
      useEventsStore.getState().cache["Current Month"].data.map(({ id }) => id)
    ).toEqual(["2"]);

    useEventsStore.getState().clearCache();
    expect(useEventsStore.getState().cache).toEqual({});
  });

  it("tracks loading state", () => {
    useEventsStore.getState().setLoading(true);
    expect(useEventsStore.getState().loading).toBe(true);
    useEventsStore.getState().setLoading(false);
    expect(useEventsStore.getState().loading).toBe(false);
  });
});
