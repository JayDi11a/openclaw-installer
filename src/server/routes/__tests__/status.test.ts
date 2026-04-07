import { describe, expect, it } from "vitest";
import { buildSavedInstanceEnvContent } from "../../deployers/local.js";
import type { DeployConfig } from "../../deployers/types.js";
import { parseSavedLocalInstanceConfig } from "../status.js";

function makeConfig(overrides: Partial<DeployConfig> = {}): DeployConfig {
  return {
    mode: "local",
    agentName: "demo",
    agentDisplayName: "Demo",
    prefix: "openclaw",
    ...overrides,
  };
}

function parseEnvFile(text: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eq = line.indexOf("=");
    if (eq < 0) {
      continue;
    }
    vars[line.slice(0, eq)] = line.slice(eq + 1);
  }
  return vars;
}

describe("parseSavedLocalInstanceConfig", () => {
  it("restores saved SecretRefs and Podman secret mappings", () => {
    const config = makeConfig({
      inferenceProvider: "openrouter",
      openrouterApiKeyRef: { source: "env", provider: "default", id: "OPENROUTER_API_KEY" },
      modelEndpointApiKeyRef: { source: "file", provider: "vault", id: "/providers/model-endpoint/apiKey" },
      podmanSecretMappings: [
        { secretName: "openrouter_api_key", targetEnv: "OPENROUTER_API_KEY" },
      ],
    });

    const savedVars = parseEnvFile(buildSavedInstanceEnvContent(config, "openclaw-demo"));
    const parsed = parseSavedLocalInstanceConfig(savedVars);

    expect(parsed.openrouterApiKeyRef).toEqual({
      source: "env",
      provider: "default",
      id: "OPENROUTER_API_KEY",
    });
    expect(parsed.modelEndpointApiKeyRef).toEqual({
      source: "file",
      provider: "vault",
      id: "/providers/model-endpoint/apiKey",
    });
    expect(parsed.podmanSecretMappings).toEqual([
      { secretName: "openrouter_api_key", targetEnv: "OPENROUTER_API_KEY" },
    ]);
  });
});
