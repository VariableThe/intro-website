"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ImageEditor } from "./ImageEditor";

export function Gallery({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {images.map((img, idx) => (
          <motion.div
            key={img}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="break-inside-avoid cursor-pointer group relative overflow-hidden bg-card border border-border"
            onClick={() => setSelectedImage(img)}
          >
            {/* Using standard img to keep masonry natural height. Next/Image is tricky with columns layout without predefined heights */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/image?file=${encodeURIComponent(img)}`}
              alt={img}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="bg-background/80 backdrop-blur-sm text-foreground px-4 py-2 font-mono text-sm shadow-xl p5-shadow">
                Edit & Download
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <ImageEditor
        image={selectedImage}
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      />
    </>
  );
}
