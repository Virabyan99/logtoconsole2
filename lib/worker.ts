self.onmessage = function (event) {
  try {
    const { code } = event.data;

    let logs: string[] = [];
    let errors: string[] = [];

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

    const detectInfiniteLoop = (code: string) => {
      const loopPatterns = [/while\s*\(\s*true\s*\)/, /for\s*\(\s*;\s*;\s*\)/];
      return loopPatterns.some((pattern) => pattern.test(code));
    };

    const restrictedGlobals = ["window", "document", "localStorage", "fetch", "alert", "navigator"];
    restrictedGlobals.forEach((global) => {
      if (code.includes(global)) {
        errors.push(`❌ Security Alert: Access to "${global}" is blocked!`);
      }
    });

    if (detectInfiniteLoop(code)) {
      errors.push("❌ Error: Infinite loop detected! Execution blocked.");
    }

    if (errors.length > 0) {
      self.postMessage({ output: errors.join("\n"), logs });
      return;
    }

    let result;
    try {
      const safeFunction = new Function('"use strict"; return (() => {' + code + '})()');
      result = safeFunction();
    } catch (error) {
      result = `❌ Runtime Error: ${error.message}`;
    }

    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;

    self.postMessage({ output: result, logs });

  } catch (error) {
    self.postMessage({ error: `❌ Fatal Error: ${error.message}` });
  }
};
