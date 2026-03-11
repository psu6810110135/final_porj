const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const net = require("node:net");

const repoRoot = path.resolve(__dirname, "..");
const backendDir = path.join(repoRoot, "project", "backend");
const frontendDir = path.join(repoRoot, "project", "frontend");

const childProcesses = [];
let shuttingDown = false;

function log(message) {
  process.stdout.write(`[playwright-web-server] ${message}\n`);
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

  log("Starting backend");
  startProcess("npm", ["run", "start:dev"], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: process.env.PORT || "3000",
      NODE_ENV: process.env.NODE_ENV || "test",
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://thai_tours:thai_tours_password@127.0.0.1:5433/thai_tours",
      JWT_SECRET:
        process.env.JWT_SECRET || "dev-secret-key-change-in-production",
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
      GOOGLE_CLIENT_ID:
        process.env.GOOGLE_CLIENT_ID || "playwright-google-client-id",
      GOOGLE_CLIENT_SECRET:
        process.env.GOOGLE_CLIENT_SECRET || "playwright-google-client-secret",
      GOOGLE_CALLBACK_URL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://127.0.0.1:3000/api/auth/google/callback",
    },
  });
  await waitForHttp("http://127.0.0.1:3000", 120_000);

  log("Starting frontend");
  startProcess(
    "npm",
    ["run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"],
    {
      cwd: frontendDir,
      env: {
        ...process.env,
        VITE_API_URL: process.env.VITE_API_URL || "http://127.0.0.1:3000",
      },
    },
  );
  await waitForHttp("http://127.0.0.1:5173", 120_000);

  log("Backend and frontend are ready for Playwright tests");
  await new Promise(() => {});
}

main().catch((error) => {
  console.error(error);
  shutdown(1);
});
