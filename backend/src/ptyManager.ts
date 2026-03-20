import * as os from 'os';
import * as pty from 'node-pty';

type OutputCallback = (data: string) => void;

interface PtySession {
  pty: pty.IPty;
  onOutput: OutputCallback;
}

class PtyManager {
  private sessions: Map<string, PtySession> = new Map();

  createSession(sessionId: string, cols: number, rows: number, onOutput: OutputCallback): void {
    if (this.sessions.has(sessionId)) {
      console.log(`[ptyManager] Session ${sessionId} already exists, destroying old one`);
      this.destroySession(sessionId);
    }

    const shell = this.getShell();
    console.log(`[ptyManager] Creating session ${sessionId} with shell: ${shell}, cols: ${cols}, rows: ${rows}`);

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: cols || 80,
      rows: rows || 24,
      cwd: process.env.HOME || os.homedir(),
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
      } as { [key: string]: string },
    });

    const session: PtySession = {
      pty: ptyProcess,
      onOutput,
    };

    this.sessions.set(sessionId, session);

    // Route PTY output to the registered callback
    ptyProcess.onData((data: string) => {
      const s = this.sessions.get(sessionId);
      if (s) {
        s.onOutput(data);
      }
    });

    ptyProcess.onExit(({ exitCode, signal }) => {
      console.log(`[ptyManager] Session ${sessionId} exited with code ${exitCode}, signal ${signal}`);
      this.sessions.delete(sessionId);
    });

    console.log(`[ptyManager] Session ${sessionId} created successfully (pid: ${ptyProcess.pid})`);
  }

  destroySession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.log(`[ptyManager] Session ${sessionId} not found, nothing to destroy`);
      return;
    }

    console.log(`[ptyManager] Destroying session ${sessionId}`);
    try {
      session.pty.kill();
    } catch (err) {
      console.error(`[ptyManager] Error killing PTY for session ${sessionId}:`, err);
    }
    this.sessions.delete(sessionId);
  }

  write(sessionId: string, data: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn(`[ptyManager] Cannot write to session ${sessionId}: not found`);
      return;
    }
    session.pty.write(data);
  }

  resize(sessionId: string, cols: number, rows: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn(`[ptyManager] Cannot resize session ${sessionId}: not found`);
      return;
    }
    try {
      session.pty.resize(cols, rows);
      console.log(`[ptyManager] Resized session ${sessionId} to ${cols}x${rows}`);
    } catch (err) {
      console.error(`[ptyManager] Error resizing session ${sessionId}:`, err);
    }
  }

  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  private getShell(): string {
    const platform = os.platform();
    if (platform === 'win32') {
      return 'powershell.exe';
    }
    // On macOS/Linux, prefer the user's shell, fallback to zsh then bash
    return process.env.SHELL || (platform === 'darwin' ? '/bin/zsh' : '/bin/bash');
  }
}

export const ptyManager = new PtyManager();
