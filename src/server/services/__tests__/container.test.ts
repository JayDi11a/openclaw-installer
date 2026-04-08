import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockExecFile } = vi.hoisted(() => ({
  mockExecFile: vi.fn(),
}));

vi.mock("node:child_process", () => ({
  execFile: mockExecFile,
}));

describe("discoverContainers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes installer-managed containers by label", async () => {
    mockExecFile.mockImplementation((_file, _args, cb) => {
      cb(null, {
        stdout: JSON.stringify([
          {
            Image: "quay.io/sallyom/openclaw-installer:latest",
            Names: ["openclaw-user-agent"],
            State: "running",
            Labels: {
              "openclaw.managed": "true",
              "openclaw.prefix": "user",
              "openclaw.agent": "agent",
            },
            CreatedAt: "now",
            Ports: "",
          },
        ]),
        stderr: "",
      });
    });

    const { discoverContainers } = await import("../container.js");
    await expect(discoverContainers("podman")).resolves.toEqual([
      expect.objectContaining({
        name: "openclaw-user-agent",
        status: "running",
      }),
    ]);
  });

  it("includes manually launched OpenClaw runtime containers", async () => {
    mockExecFile.mockImplementation((_file, _args, cb) => {
      cb(null, {
        stdout: JSON.stringify([
          {
            Image: "ghcr.io/openclaw/openclaw:latest",
            Names: ["manual-openclaw"],
            State: "running",
            Labels: {},
            CreatedAt: "now",
            Ports: "",
          },
        ]),
        stderr: "",
      });
    });

    const { discoverContainers } = await import("../container.js");
    await expect(discoverContainers("podman")).resolves.toEqual([
      expect.objectContaining({
        name: "manual-openclaw",
        image: "ghcr.io/openclaw/openclaw:latest",
      }),
    ]);
  });

  it("excludes installer containers that only match openclaw-installer by image name", async () => {
    mockExecFile.mockImplementation((_file, _args, cb) => {
      cb(null, {
        stdout: JSON.stringify([
          {
            Image: "quay.io/sallyom/openclaw-installer:latest",
            Names: ["openclaw-installer"],
            State: "running",
            Labels: {},
            CreatedAt: "now",
            Ports: "",
          },
        ]),
        stderr: "",
      });
    });

    const { discoverContainers } = await import("../container.js");
    await expect(discoverContainers("podman")).resolves.toEqual([]);
  });
});

describe("filterExistingPodmanSecretMappings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps only Podman secret mappings whose secrets exist", async () => {
    mockExecFile.mockImplementation((_file, args, cb) => {
      if (Array.isArray(args) && args[0] === "secret" && args[1] === "exists") {
        const secretName = args[2];
        if (secretName === "anthropic_api_key") {
          cb(null, { stdout: "", stderr: "" });
          return;
        }
        cb(new Error("missing"));
        return;
      }
      cb(new Error(`unexpected args: ${JSON.stringify(args)}`));
    });

    const { filterExistingPodmanSecretMappings } = await import("../container.js");
    await expect(
      filterExistingPodmanSecretMappings("podman", [
        { secretName: "anthropic_api_key", targetEnv: "ANTHROPIC_API_KEY" },
        { secretName: "openrouter_api_key", targetEnv: "OPENROUTER_API_KEY" },
      ]),
    ).resolves.toEqual([
      { secretName: "anthropic_api_key", targetEnv: "ANTHROPIC_API_KEY" },
    ]);
  });

  it("skips Podman secret mappings entirely when using docker", async () => {
    const { filterExistingPodmanSecretMappings } = await import("../container.js");
    await expect(
      filterExistingPodmanSecretMappings("docker", [
        { secretName: "anthropic_api_key", targetEnv: "ANTHROPIC_API_KEY" },
      ]),
    ).resolves.toBeUndefined();
    expect(mockExecFile).not.toHaveBeenCalled();
  });
});
