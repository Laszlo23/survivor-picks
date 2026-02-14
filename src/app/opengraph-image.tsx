import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RealityPicks — Predict Reality TV. Win Glory.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0a0a14 0%, #0d1117 40%, #0a0a14 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Cyan spotlight */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 70%)",
          }}
        />
        {/* Magenta spotlight */}
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,0,128,0.1) 0%, transparent 70%)",
          }}
        />

        {/* ON AIR badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
            padding: "6px 16px",
            borderLeft: "3px solid #00e5ff",
            background: "rgba(0,229,255,0.08)",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#00e5ff",
            }}
          />
          <span
            style={{
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "#00e5ff",
              textTransform: "uppercase" as const,
            }}
          >
            ON AIR
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "white",
            margin: "0",
            textAlign: "center",
            lineHeight: 1.1,
            textTransform: "uppercase" as const,
            letterSpacing: "-0.02em",
          }}
        >
          RealityPicks
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "28px",
            fontWeight: 600,
            color: "#00e5ff",
            margin: "16px 0 0 0",
            textAlign: "center",
          }}
        >
          Predict Reality TV. Win Glory.
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.5)",
            margin: "16px 0 0 0",
            textAlign: "center",
          }}
        >
          Free prediction game on Base — Survivor, The Traitors, The Bachelor & more
        </p>
      </div>
    ),
    { ...size }
  );
}
