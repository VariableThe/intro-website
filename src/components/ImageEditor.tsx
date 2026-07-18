"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Maximize, Smartphone, Monitor } from "lucide-react";

interface ImageEditorProps {
  image: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESETS = [
  { label: "Original", icon: RefreshCw, width: null, height: null },
  { label: "Desktop (16:9)", icon: Monitor, width: 1920, height: 1080 },
  { label: "Mobile (9:16)", icon: Smartphone, width: 1080, height: 1920 },
  { label: "Square (1:1)", icon: Maximize, width: 1080, height: 1080 },
];

export function ImageEditor({ image, open, onOpenChange }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [preset, setPreset] = useState(PRESETS[0]);
  
  // Custom dimensions (if user wants to override preset)
  const [customW, setCustomW] = useState("");
  const [customH, setCustomH] = useState("");

  // Reset filters when a new image is opened
  useEffect(() => {
    if (open && image) {
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setPreset(PRESETS[0]);
      setCustomW("");
      setCustomH("");

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `/api/image?file=${encodeURIComponent(image)}`;
      img.onload = () => {
        imageRef.current = img;
        drawCanvas();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, image]);

  // Redraw canvas whenever filters or preset change
  useEffect(() => {
    if (open) drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brightness, contrast, saturation, preset, customW, customH]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Determine target dimensions
    let targetW = img.width;
    let targetH = img.height;

    if (customW && customH && !isNaN(Number(customW)) && !isNaN(Number(customH))) {
      targetW = Number(customW);
      targetH = Number(customH);
    } else if (preset.width && preset.height) {
      targetW = preset.width;
      targetH = preset.height;
    }

    // Set canvas size
    canvas.width = targetW;
    canvas.height = targetH;

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Calculate crop (cover mode)
    const imgAspect = img.width / img.height;
    const targetAspect = targetW / targetH;
    
    let drawW = targetW;
    let drawH = targetH;
    let offsetX = 0;
    let offsetY = 0;

    if (imgAspect > targetAspect) {
      // Image is wider than target
      drawW = targetH * imgAspect;
      offsetX = (targetW - drawW) / 2;
    } else {
      // Image is taller than target
      drawH = targetW / imgAspect;
      offsetY = (targetH - drawH) / 2;
    }

    ctx.clearRect(0, 0, targetW, targetH);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const link = document.createElement("a");
    link.download = `edited-${image}`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[95vw] w-full p-0 overflow-hidden bg-background border-border">
        <DialogTitle className="sr-only">Edit Wallpaper</DialogTitle>
        <DialogDescription className="sr-only">Adjust brightness, contrast, saturation and download in different sizes.</DialogDescription>
        
        <div className="flex flex-col md:flex-row h-[90vh]">
          
          {/* Preview Area */}
          <div className="flex-1 bg-neutral-900/50 flex items-center justify-center p-6 relative overflow-hidden">
            <canvas 
              ref={canvasRef} 
              className="max-w-full max-h-full object-contain shadow-2xl transition-all"
              style={{
                // Visual CSS preview of the canvas bounds
                boxShadow: "0 20px 50px -12px rgba(0,0,0,0.5)"
              }}
            />
          </div>

          {/* Controls Area */}
          <div className="w-full md:w-80 border-l border-border bg-card p-6 flex flex-col overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 font-mono tracking-tight text-primary">Editor</h2>
            
            <div className="space-y-6 flex-1">
              {/* Adjustments */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/60">Adjustments</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span>Brightness</span>
                    <span>{brightness}%</span>
                  </div>
                  <Slider value={[brightness]} min={0} max={200} step={1} onValueChange={(v: number | readonly number[]) => setBrightness(Array.isArray(v) ? v[0] : v)} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span>Contrast</span>
                    <span>{contrast}%</span>
                  </div>
                  <Slider value={[contrast]} min={0} max={200} step={1} onValueChange={(v: number | readonly number[]) => setContrast(Array.isArray(v) ? v[0] : v)} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span>Saturation</span>
                    <span>{saturation}%</span>
                  </div>
                  <Slider value={[saturation]} min={0} max={200} step={1} onValueChange={(v: number | readonly number[]) => setSaturation(Array.isArray(v) ? v[0] : v)} />
                </div>
              </div>

              <hr className="border-border" />

              {/* Crop & Size */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/60">Aspect Ratio</h3>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((p) => {
                    const isSelected = preset.label === p.label && !customW && !customH;
                    return (
                      <Button
                        key={p.label}
                        variant={isSelected ? "default" : "outline"}
                        className="h-14 flex flex-col items-center justify-center gap-1 border-border/50"
                        onClick={() => {
                          setPreset(p);
                          setCustomW("");
                          setCustomH("");
                        }}
                      >
                        <p.icon size={16} />
                        <span className="text-[10px]">{p.label}</span>
                      </Button>
                    );
                  })}
                </div>

                <div className="space-y-2 mt-4">
                  <span className="text-xs font-mono text-foreground/70">Custom Size (px)</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Width" 
                      className="w-full bg-transparent border border-border px-2 py-1.5 text-sm font-mono outline-none focus:border-primary transition-colors"
                      value={customW}
                      onChange={(e) => setCustomW(e.target.value)}
                    />
                    <span className="text-foreground/40 text-xs">x</span>
                    <input 
                      type="number" 
                      placeholder="Height" 
                      className="w-full bg-transparent border border-border px-2 py-1.5 text-sm font-mono outline-none focus:border-primary transition-colors"
                      value={customH}
                      onChange={(e) => setCustomH(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 mt-6 border-t border-border">
              <Button 
                onClick={handleDownload} 
                className="w-full h-12 font-mono text-base p5-shadow p5-skew bg-primary text-primary-foreground hover:bg-primary/90 rounded-none border-none"
              >
                <Download className="mr-2" size={18} /> Download
              </Button>
            </div>
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
