import { pollScan } from "../src/lib/api";

// Mock fetch globally
global.fetch = jest.fn();
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(null),
}));
jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ auth: { getSession: jest.fn().mockResolvedValue({ data: { session: null } }), onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })) } }),
}));

describe("pollScan", () => {
  beforeEach(() => jest.clearAllMocks());

  it("resolves when scan completes", async () => {
    const completedScan = { id: "scan-1", status: "complete", score: 85, grade: "B" };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => completedScan,
    });
    const result = await pollScan("scan-1", undefined, 50, 5000);
    expect(result.status).toBe("complete");
    expect(result.score).toBe(85);
  });

  it("rejects on error status", async () => {
    const errorScan = { id: "scan-1", status: "error", error_message: "Connection refused" };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => errorScan,
    });
    await expect(pollScan("scan-1", undefined, 50, 5000)).rejects.toThrow("Connection refused");
  });

  it("rejects on timeout", async () => {
    const runningScan = { id: "scan-1", status: "running" };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => runningScan,
    });
    await expect(pollScan("scan-1", undefined, 50, 200)).rejects.toThrow("timed out");
  });

  it("calls onProgress callback", async () => {
    const progressCalls: string[] = [];
    let callCount = 0;
    (global.fetch as jest.Mock).mockImplementation(async () => ({
      ok: true,
      json: async () => {
        callCount++;
        return callCount < 3
          ? { id: "scan-1", status: "running" }
          : { id: "scan-1", status: "complete", score: 90 };
      },
    }));
    await pollScan("scan-1", (s) => progressCalls.push(s), 50, 5000);
    expect(progressCalls).toContain("running");
    expect(progressCalls).toContain("complete");
  });
});

describe("config", () => {
  it("PLAN_LIMITS has correct values", async () => {
    const { PLAN_LIMITS } = await import("../src/lib/config");
    expect(PLAN_LIMITS.free.scans).toBe(5);
    expect(PLAN_LIMITS.pro.scans).toBe(100);
    expect(PLAN_LIMITS.team.scans).toBe(9999);
    expect(PLAN_LIMITS.free.pdf).toBe(false);
    expect(PLAN_LIMITS.pro.pdf).toBe(true);
  });

  it("GRADE_COLOR returns correct colors", async () => {
    const { GRADE_COLOR, COLORS } = await import("../src/lib/config");
    expect(GRADE_COLOR("A")).toBe(COLORS.gradeA);
    expect(GRADE_COLOR("F")).toBe(COLORS.gradeF);
  });

  it("SEV_COLOR returns correct colors", async () => {
    const { SEV_COLOR, COLORS } = await import("../src/lib/config");
    expect(SEV_COLOR("critical")).toBe(COLORS.critical);
    expect(SEV_COLOR("low")).toBe(COLORS.low);
  });
});
