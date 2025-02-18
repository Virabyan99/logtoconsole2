"use client";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ScreenshotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetRef?: React.RefObject<HTMLDivElement>;
}

const ScreenshotDialog: React.FC<ScreenshotDialogProps> = ({ isOpen, onClose, targetRef }) => {
  const [selectedSize, setSelectedSize] = useState("16:9");
  const [customSize, setCustomSize] = useState({ width: "", height: "" });

  const handleCapture = async () => {
    if (!targetRef?.current) return;
  
    try {
      let width = targetRef.current.offsetWidth;
      let height = targetRef.current.offsetHeight;
  
      if (selectedSize !== "As in browser") {
        switch (selectedSize) {
          case "1×1":
            width = 500;
            height = 500;
            break;
          case "16×9":
            width = 1280;
            height = 720;
            break;
          case "9×16":
            width = 720;
            height = 1280;
            break;
          case "4×5":
            width = 800;
            height = 1000;
            break;
          case "5×4":
            width = 1000;
            height = 800;
            break;
          case "custom":
            width = customSize.width ? parseInt(customSize.width) : width;
            height = customSize.height ? parseInt(customSize.height) : height;
            break;
        }
      }
  
      // ✅ Create a temporary container for proper scaling
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px"; // Hide from view
      tempContainer.style.width = `${width}px`;
      tempContainer.style.height = `${height}px`;
      tempContainer.style.transform = `scale(${width / targetRef.current.offsetWidth})`;
      tempContainer.style.transformOrigin = "top left";
  
      // ✅ Clone content into temporary container
      const clonedContent = targetRef.current.cloneNode(true);
      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);
  
      // ✅ Capture the properly scaled screenshot
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: null,
        useCORS: true,
        allowTaint: false,
        scale: 1, // Scaling is handled via CSS transform
      });
  
      // ✅ Remove temporary container after capture
      document.body.removeChild(tempContainer);
  
      // ✅ Convert canvas to image
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "screenshot.png";
  
      // ✅ Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      onClose(); // ✅ Close dialog after capture
    } catch (error) {
      console.error("❌ Screenshot Capture Failed:", error);
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black text-white border-none rounded-lg p-6 w-[500px]">
      <VisuallyHidden>
            <DialogTitle>
                Header meader
            </DialogTitle>
        </VisuallyHidden>
        <h2 className="text-lg font-semibold">Screenshot Settings</h2>

        <div className="mt-4">
          <p className="text-sm text-gray-400">Aspect Ratio</p>
          <div className="flex gap-2 mt-2">
            {["As in browser", "1×1", "16×9", "9×16", "4×5", "5×4"].map((ratio) => (
              <Button
                key={ratio}
                onClick={() => setSelectedSize(ratio)}
                className={`px-3 py-1 rounded-md ${selectedSize === ratio ? "bg-blue-500" : "bg-gray-700"}`}
              >
                {ratio}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => setSelectedSize("custom")}
            className="mt-2 px-3 py-1 rounded-md bg-blue-600 text-white"
          >
            Set Custom Sizes
          </Button>

          {selectedSize === "custom" && (
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                placeholder="Width"
                value={customSize.width}
                onChange={(e) => setCustomSize({ ...customSize, width: e.target.value })}
                className="w-24 p-2 border bg-gray-900 text-white rounded-md"
              />
              <span className="text-gray-400">px ×</span>
              <input
                type="number"
                placeholder="Height"
                value={customSize.height}
                onChange={(e) => setCustomSize({ ...customSize, height: e.target.value })}
                className="w-24 p-2 border bg-gray-900 text-white rounded-md"
              />
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex justify-between">
          <Button onClick={handleCapture} className="bg-blue-600 px-5 py-2 rounded-md">
            Save
          </Button>
          <Button onClick={onClose} className="bg-gray-600 px-5 py-2 rounded-md">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScreenshotDialog;
