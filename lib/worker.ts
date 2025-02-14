self.onmessage = function (event) {
  try {
    const { code } = event.data;

    // Array to store logs
    let logs: string[] = [];

    // Capture console.log() output
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      logs.push(args.map(arg => JSON.stringify(arg)).join(" "));
    };

    // Detect infinite loops
    const detectInfiniteLoop = (code: string) => {
      const loopPatterns = [/while\s*\(\s*true\s*\)/, /for\s*\(\s*;\s*;\s*\)/];
      return loopPatterns.some((pattern) => pattern.test(code));
    };

    if (detectInfiniteLoop(code)) {
      self.postMessage({ error: "❌ Infinite loop detected! Execution blocked." });
      return;
    }

    let result;
    try {
      result = eval(code); // Execute code safely
    } catch (error) {
      result = error.message;
    }

    // Restore original console.log to prevent issues
    console.log = originalConsoleLog;

    // Send logs and result back
    self.postMessage({ output: result, logs });

  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
