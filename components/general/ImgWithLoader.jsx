"use client";

import { useCallback, useRef, useState } from "react";
import NextImage from "next/image";

/**
 * next/image with a lightweight placeholder: a CSS shimmer (compositor-only,
 * no JavaScript animation) while the image loads, then a short fade-in.
 *
 * This replaces a per-image Lottie loader, which ran a JS animation for every
 * image still loading. In a scrolling product grid that meant dozens at once,
 * exactly when the browser was busiest decoding images, which caused stutter.
 *
 * `loaderSize` and `loaderClassName` are accepted for backwards compatibility.
 */
export default function ImgWithLoader({
  className,
  style,
  imgClassName,
  showLoader = true,
  loaderSize,
  loaderClassName,
  priority,
  onLoadingComplete, // deprecated in next/image; still honoured
  onLoad,
  onError,
  ...imgProps
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const srcRef = useRef(imgProps.src);
  srcRef.current = imgProps.src;
  const imageClass = imgClassName ?? className;

  const handleLoad = useCallback(
    (e) => {
      setLoaded(true);
      setError(false);
      onLoad?.(e);
      if (typeof onLoadingComplete === "function") {
        try {
          onLoadingComplete(e?.currentTarget);
        } catch (_) {
          onLoadingComplete();
        }
      }
    },
    [onLoad, onLoadingComplete]
  );

  const handleError = useCallback(
    (e) => {
      const failedSrc = srcRef.current;
      try {
        onError?.(e);
      } catch (_) {}
      // Let a parent swap in a fallback src first; only show the error state
      // if the src is still the one that failed.
      setTimeout(() => {
        if (srcRef.current === failedSrc) {
          setError(true);
          setLoaded(true);
        }
      }, 50);
    },
    [onError]
  );

  const src =
    imgProps.src && typeof imgProps.src === "object"
      ? imgProps.src.src || imgProps.src.url || String(imgProps.src)
      : imgProps.src || "/logo.webp";

  return (
    <div className={className} style={{ position: "relative", display: "inline-block", ...style }}>
      {showLoader && !loaded && !error && (
        <div className={`img-shimmer ${loaderClassName || ""}`} aria-hidden="true" />
      )}

      {error ? (
        <div className="img-unavailable" style={{ width: imgProps.width || "100%", height: imgProps.height || "100%" }}>
          Image unavailable
        </div>
      ) : (
        <NextImage
          {...imgProps}
          src={src}
          className={`${imageClass || ""} img-fade ${loaded || priority ? "is-loaded" : ""}`.trim()}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}
