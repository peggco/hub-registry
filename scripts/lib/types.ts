export type Kind = "skill" | "mcp" | "plugin";

export interface SkillEntry {
  schemaVersion: 1;
  kind: "skill";
  name: string;
  skillId: string;
  source: string;
  isOfficial?: boolean;
  url?: string;
  license?: string;
  description?: string;
  tags?: string[];
  path?: string;
  install?: {
    type: "github";
    source: string;
    path?: string;
    ref?: string;
  };
  meta?: Record<string, unknown>;
}

export interface MCPEntry {
  schemaVersion: 1;
  kind: "mcp";
  id: string;
  name: string;
  description: string;
  vendor?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  isOfficial?: boolean;
  version?: string;
  tags?: string[];
  transport: MCPTransport;
  requiredEnv?: string[];
  readme?: ReadmeRef;
}

export type MCPTransport =
  | {
      type: "stdio";
      command: string;
      args?: string[];
      env?: Record<string, string>;
    }
  | {
      type: "sse" | "http";
      url: string;
      headers?: Record<string, string>;
    };

export interface PluginEntry {
  schemaVersion: 1;
  kind: "plugin";
  id: string;
  name: string;
  description: string;
  repository: string;
  homepage?: string;
  license?: string;
  isOfficial?: boolean;
  version: string;
  requires?: {
    pegg?: string;
    protocol?: number;
  };
  tags?: string[];
  capabilities?: Array<"tools" | "skills" | "permissions" | "commands" | "events">;
  platforms?: Array<"linux" | "darwin">;
  arch?: Array<"amd64" | "arm64">;
  install: {
    type: "github-release";
    source: string;
    assetPattern?: string;
  };
  readme?: ReadmeRef;
}

export interface ReadmeRef {
  type: "github" | "none";
  source?: string;
}

export interface PublishedSkill {
  name: string;
  skillId: string;
  source: string;
  isOfficial?: boolean;
  url?: string;
  license?: string;
  description?: string;
  tags?: string[];
  path?: string;
  meta?: Record<string, unknown>;
}

export interface ValidationIssue {
  file: string;
  message: string;
}

export interface CatalogFile {
  count: number;
  sha256: string;
  etag: string;
}
