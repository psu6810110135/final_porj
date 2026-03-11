const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const net = require("node:net");

const repoRoot = path.resolve(__dirname, "..");
const backendDir = path.join(repoRoot, "project", "backend");
const frontendDir = path.join(repoRoot, "project", "frontend");
const backendEnvPath = path.join(backendDir, ".env");
const frontendEnvPath = path.join(frontendDir, ".env");

const childProcesses = [];
let shuttingDown = false;

function log(message) {
  process.stdout.write(`[playwright-web-server] ${message}\n`);
}

function parseDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  const env = {};

  for (const rawLine of fileContent.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function getRequiredEnv(name, env) {
  if (!env[name]) {
    throw new Error(
      `Missing required env ${name}. Set it in your shell or ${path.relative(repoRoot, backendEnvPath)}`,
    );
  }

  return env[name];
}

function buildBackendEnv() {
  const backendDotEnv = parseDotEnvFile(backendEnvPath);
  const mergedEnv = {
    ...backendDotEnv,
    ...process.env,
    PORT: process.env.PORT || backendDotEnv.PORT || "3000",
    NODE_ENV: process.env.NODE_ENV || backendDotEnv.NODE_ENV || "test",
  };

  return {
    ...mergedEnv,
    DATABASE_URL: getRequiredEnv("DATABASE_URL", mergedEnv),
    JWT_SECRET: getRequiredEnv("JWT_SECRET", mergedEnv),
    GOOGLE_CLIENT_ID: getRequiredEnv("GOOGLE_CLIENT_ID", mergedEnv),
    GOOGLE_CLIENT_SECRET: getRequiredEnv("GOOGLE_CLIENT_SECRET", mergedEnv),
    GOOGLE_CALLBACK_URL: getRequiredEnv("GOOGLE_CALLBACK_URL", mergedEnv),
  };
}

function buildFrontendEnv() {
  const frontendDotEnv = parseDotEnvFile(frontendEnvPath);

  return {
    ...frontendDotEnv,
    ...process.env,
    VITE_API_URL:
      process.env.VITE_API_URL ||
      frontendDotEnv.VITE_API_URL ||
      "http://127.0.0.1:3000",
  };
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? repoRoot,
      env: options.env ?? process.env,
      stdio: options.stdio ?? "inherit",
      shell: false,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(`${command} ${args.join(" ")} exited with code ${code}`),
      );
    });
  });
}

function startProcess(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: options.env ?? process.env,
    stdio: options.stdio ?? "inherit",
    shell: false,
  });

  childProcesses.push(child);

  child.on("exit", (code, signal) => {
    if (!shuttingDown && code !== 0) {
      log(
        `${command} ${args.join(" ")} exited unexpectedly with code ${code ?? signal}`,
      );
      process.exit(code ?? 1);
    }
  });

  return child;
}

function waitForTcpPort(host, port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.createConnection({ host, port });

      socket.once("connect", () => {
        socket.end();
        resolve();
      });

      socket.once("error", () => {
        socket.destroy();
        if (Date.now() > deadline) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }

        setTimeout(tryConnect, 1000);
      });
    };

    tryConnect();
  });
}

function isTcpPortOpen(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });

    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });

    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForHttp(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) {
        return;
      }
    } catch {
      // Poll until the service comes up.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function ensureDependencies(dir) {
  if (fs.existsSync(path.join(dir, "node_modules"))) {
    return;
  }

  log(`Installing dependencies in ${path.relative(repoRoot, dir)}`);
  await runCommand("npm", ["ci"], { cwd: dir });
}

async function ensurePostgres() {
  try {
    await runCommand("docker", ["start", "thai_tours_db"], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    log("Started existing PostgreSQL container thai_tours_db");
  } catch {
    log("Starting PostgreSQL via docker compose");
    await runCommand("docker", ["compose", "up", "-d", "postgres"], {
      cwd: repoRoot,
    });
  }

  await waitForTcpPort("127.0.0.1", 5433, 120_000);
  log("PostgreSQL is ready on 127.0.0.1:5433");
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of childProcesses) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => {
    for (const child of childProcesses) {
      if (!child.killed) {
        child.kill("SIGKILL");
      }
    }
    process.exit(exitCode);
  }, 4000).unref();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

async function main() {
  await ensureDependencies(backendDir);
  await ensureDependencies(frontendDir);
  await ensurePostgres();
  const backendEnv = buildBackendEnv();
  const frontendEnv = buildFrontendEnv();

  const backendAlreadyRunning = await isTcpPortOpen("127.0.0.1", 3000);
  if (backendAlreadyRunning) {
    log("Backend already running on 127.0.0.1:3000, skipping start");
  } else {
    log("Starting backend");
    startProcess("npm", ["run", "start:dev"], {
      cwd: backendDir,
      env: backendEnv,
    });
  }
  await waitForHttp("http://127.0.0.1:3000", 120_000);

  const frontendAlreadyRunning = await isTcpPortOpen("127.0.0.1", 5173);
  if (frontendAlreadyRunning) {
    log("Frontend already running on 127.0.0.1:5173, skipping start");
  } else {
    log("Starting frontend");
    startProcess(
      "npm",
      ["run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"],
      {
        cwd: frontendDir,
        env: frontendEnv,
      },
    );
  }
  await waitForHttp("http://127.0.0.1:5173", 120_000);

  log("Backend and frontend are ready for Playwright tests");
  await new Promise(() => {});
}

main().catch((error) => {
  console.error(error);
  shutdown(1);
});
