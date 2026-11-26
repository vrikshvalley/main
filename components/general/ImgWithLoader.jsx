"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NextImage from "next/image";

function optimizeCloudinaryUrl(url) {
  if (typeof url !== "string" || !url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }
  // Inject automatic format + quality so NextImage `sizes` handles responsive mobile/desktop widths.
  const [, rest] = url.split("/image/upload/");
  if (!rest || /^(?:[a-z_]+,|[a-z]{1,2}_)/.test(rest)) return url;
  return url.replace("/image/upload/", "/image/upload/f_auto,q_auto:good/");
}

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

  const rawSrc =
    imgProps.src && typeof imgProps.src === "object"
      ? imgProps.src.src || imgProps.src.url || String(imgProps.src)
      : imgProps.src || "/logo.webp";
  const src = optimizeCloudinaryUrl(rawSrc);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  const handleLoad = useCallback(
    (e) => {
      const target = e?.currentTarget;
      const reveal = () => {
        setLoaded(true);
        setError(false);
        onLoad?.(e);
        if (typeof onLoadingComplete === "function") {
          try {
            onLoadingComplete(target);
          } catch (_) {
            onLoadingComplete();
          }
        }
      };
      // Wait for full bitmap decode before fading in so images never paint top-to-bottom.
      if (target && typeof target.decode === "function") {
        target.decode().catch(() => {}).finally(reveal);
      } else {
        reveal();
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
      setTimeout(() => {
        if (srcRef.current === failedSrc) {
          setError(true);
          setLoaded(true);
        }
      }, 50);
    },
    [onError]
  );

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
          decoding="async"
          className={`${imageClass || ""} img-fade ${loaded ? "is-loaded" : ""}`.trim()}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}
