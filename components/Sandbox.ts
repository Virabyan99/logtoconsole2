import DOMPurify from "dompurify";

class Sandbox {
  private iframe: HTMLIFrameElement;
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  constructor() {
    this.iframe = document.createElement("iframe");
    // Add 'allow-same-origin' to enable proper message communication
    this.iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    this.iframe.style.display = "none";
    document.body.appendChild(this.iframe);
  }

  executeCode(code: string, callback: (result: any) => void) {
    const sanitizedCode = DOMPurify.sanitize(code);
    const blob = new Blob([sanitizedCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);

    // Create a cleanup function
    const cleanup = () => {
      URL.revokeObjectURL(url);
      if (this.messageHandler) {
        window.removeEventListener("message", this.messageHandler);
      }
    };

    this.messageHandler = (event: MessageEvent) => {
      // Security check: only accept messages from our iframe
      if (event.source === this.iframe.contentWindow) {
        callback(event.data);
        cleanup();
      }
    };

    window.addEventListener("message", this.messageHandler);

    // Ensure iframe document is ready
    const iframeDoc = this.iframe.contentWindow?.document;
    if (iframeDoc) {
      const script = iframeDoc.createElement("script");
      script.src = url;
      script.onload = () => URL.revokeObjectURL(url); // Cleanup after load
      iframeDoc.body.appendChild(script);
    } else {
      cleanup();
    }
  }

  destroy() {
    if (this.messageHandler) {
      window.removeEventListener("message", this.messageHandler);
    }
    document.body.removeChild(this.iframe);
  }
}

export default Sandbox;