class Sandbox {
  private worker: Worker | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.worker = new Worker(new URL("../lib/worker.ts", import.meta.url), {
        type: "module",
      });
    }
  }

  executeCode(code: string, callback: (result: any) => void) {
    if (!this.worker) return;

    this.worker.onmessage = (event) => {
      callback(event.data);
    };
    this.worker.postMessage({ code });
  }

  resetWorker() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = new Worker(new URL("../lib/worker.ts", import.meta.url), {
        type: "module",
      });
    }
  }
}

export default Sandbox;
