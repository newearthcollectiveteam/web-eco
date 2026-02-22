"use client";

import { useEffect, useRef, useState } from "react";

interface LazyShaderProps {
  src: string;
  className?: string;
  title?: string;
  opacity?: number;
}

export function LazyShader({
  src,
  className = "",
  title = "Background Shader",
  opacity = 0.3,
}: LazyShaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Load slightly before it enters viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? (
        <>
          {/* Gradient placeholder while shader loads */}
          {!isLoaded && (
            <div
              className="bg-gradient-radial absolute inset-0 from-purple-900/20 via-indigo-950/10 to-black transition-opacity duration-1000"
              style={{ opacity }}
            />
          )}
          {/* Shader iframe */}
          <iframe
            src={src}
            className="h-full w-full border-0 transition-opacity duration-1000"
            style={{
              pointerEvents: "none",
              opacity: isLoaded ? opacity : 0,
            }}
            title={title}
            onLoad={() => setIsLoaded(true)}
          />
        </>
      ) : (
        /* Static gradient placeholder before lazy load */
        <div
          className="bg-gradient-radial absolute inset-0 from-purple-900/20 via-indigo-950/10 to-black"
          style={{ opacity }}
        />
      )}
    </div>
  );
}
