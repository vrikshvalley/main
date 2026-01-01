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
  ...imgProps
}) {
  const [loaded, setLoaded] = useState(false);
  const [lottieData, setLottieData] = useState(null);
  const imageClass = imgClassName ?? className;

  const shouldShowLoader = showLoader && !loaded;

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
      <NextImage
        {...{
          ...imgProps,
          src:
            imgProps && imgProps.src && typeof imgProps.src === "object"
              ? imgProps.src.src || imgProps.src.url || String(imgProps.src)
              : imgProps.src,
        }}
        className={imageClass}
        priority={priority}
        onLoad={handleOnLoad}
      />

      <style jsx global>{`
        @keyframes imgWithLoaderSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
