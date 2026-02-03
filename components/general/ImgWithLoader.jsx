"use client";

import { useEffect, useMemo, useState } from "react";
import NextImage from "next/image";
import Lottie from "lottie-react";

export default function ImgWithLoader({
  className,
  style,
  imgClassName,
  showLoader = true,
  loaderSize = 72,
  loaderClassName,
  priority,
  onLoadingComplete, // deprecated from next/image; kept for backward-compat only
  onLoad,
  onError,
  ...imgProps
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [lottieData, setLottieData] = useState(null);
  const imageClass = imgClassName ?? className;

  const shouldShowLoader = showLoader && !loaded && !error;

  useEffect(() => {
    if (!showLoader) return;
    let cancelled = false;
    const fetchLottie = async () => {
      try {
        const res = await fetch("/imgLoader.json", { cache: "force-cache" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setLottieData(data);
      } catch (_) {
        // ignore; loader will just not render
      }
    };
    fetchLottie();
    return () => {
      cancelled = true;
    };
  }, [showLoader]);

  const handleOnLoad = useMemo(() => {
    return (e) => {
      setLoaded(true);
      setError(false);
      if (typeof onLoad === "function") onLoad(e);
      // best-effort compatibility: call deprecated callback without passing it to NextImage
      if (typeof onLoadingComplete === "function") {
        try {
          onLoadingComplete(e?.currentTarget);
        } catch (_) {
          onLoadingComplete();
        }
      }
    };
  }, [onLoad, onLoadingComplete]);

  const handleOnError = useMemo(() => {
    return (e) => {
      const currentSrc = imgProps && imgProps.src;
      if (typeof onError === "function") {
        try { onError(e); } catch (_) {}
      }
      // Give parent a short moment to update the `src` (fallback). If the
      // src remains unchanged after a tick, mark as error so the placeholder
      // is shown. This prevents the component from short-circuiting parent
      // fallback logic by immediately setting error state.
      setTimeout(() => {
        const newSrc = imgProps && imgProps.src;
        if (newSrc === currentSrc) {
          setError(true);
          setLoaded(true);
        }
      }, 50);
    };
  }, [onError]);

  return (
    <div
      className={className}
      style={{ position: "relative", display: "inline-block", ...style }}
    >
      {shouldShowLoader && (
        <div
          className={loaderClassName}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            background: "transparent",
          }}
          aria-hidden
        >
          {lottieData ? (
            <Lottie
              animationData={lottieData}
              loop
              autoplay
              style={{ width: loaderSize, height: loaderSize }}
            />
          ) : (
            <div
              style={{
                width: loaderSize,
                height: loaderSize,
                borderRadius: "50%",
                border: "3px solid rgba(0,0,0,0.1)",
                borderTopColor: "#2e7d5a",
                animation: "imgWithLoaderSpin 1s linear infinite",
              }}
            />
          )}
        </div>
      )}

      {
        // Normalize src: some product images are objects like { src, newest }
        // Next Image requires a string src or a static import object with width/height.
        // Coerce object -> string here to avoid runtime errors.
      }
      {error ? (
        <div
          style={{
            width: imgProps.width || "100%",
            height: imgProps.height || "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0f0f0",
            color: "#999",
            fontSize: "14px",
          }}
        >
          Image unavailable
        </div>
      ) : (
        <NextImage
          {...{
            ...imgProps,
            src:
              imgProps && imgProps.src && typeof imgProps.src === "object"
                ? imgProps.src.src || imgProps.src.url || String(imgProps.src)
                : imgProps.src || "/1.png",
          }}
          className={imageClass}
          priority={priority}
          onLoad={handleOnLoad}
          onError={handleOnError}
        />
      )}

      <style jsx global>{`
        @keyframes imgWithLoaderSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
