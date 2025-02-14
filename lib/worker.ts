self.onmessage = function (event) {
  try {
    const { code } = event.data;

    // 🔹 Array to store logs and errors
    let logs: string[] = [];
    let errors: string[] = [];

    // 🔹 Capture console.log(), console.warn(), and console.error()
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    console.log = (...args) => {
      logs.push(`✅ ${args.map(arg => JSON.stringify(arg)).join(" ")}`);
    };

    console.warn = (...args) => {
      logs.push(`⚠️ ${args.map(arg => JSON.stringify(arg)).join(" ")}`);
    };

    console.error = (...args) => {
      logs.push(`❌ ${args.map(arg => JSON.stringify(arg)).join(" ")}`);
    };

    // 🛑 Detect infinite loops
    const detectInfiniteLoop = (code: string) => {
      const loopPatterns = [/while\s*\(\s*true\s*\)/, /for\s*\(\s*;\s*;\s*\)/];
      return loopPatterns.some((pattern) => pattern.test(code));
    };

    // 🚨 Block access to dangerous global objects
    const restrictedGlobals = ["window", "document", "localStorage", "fetch", "alert", "navigator"];
    restrictedGlobals.forEach((global) => {
      if (code.includes(global)) {
        errors.push(`❌ Security Alert: Access to "${global}" is blocked!`);
      }
    });

    // 🛑 If an infinite loop is found, block execution but show all previous errors
    if (detectInfiniteLoop(code)) {
      errors.push("❌ Error: Infinite loop detected! Execution blocked.");
    }

    // 🔹 If any errors were found, stop execution and return all errors
    if (errors.length > 0) {
      self.postMessage({ output: errors.join("\n"), logs });
      return;
    }

    let result;
    try {
      // ✅ Use Function constructor instead of eval for safer execution
      const safeFunction = new Function('"use strict"; return (() => {' + code + '})()');
      result = safeFunction();
    } catch (error) {
      result = `❌ Runtime Error: ${error.message}`;
    }

    // 🔹 Restore original console functions to prevent issues
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;

    // 🔹 Send logs and result back
    self.postMessage({ output: result, logs });

  } catch (error) {
    self.postMessage({ error: `❌ Fatal Error: ${error.message}` });
  }
};
