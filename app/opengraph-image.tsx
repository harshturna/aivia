import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Aivia: Describe it. Watch it get made.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share image (TICKET-016, TICKET-021): the forest the landing opens on, the headline
 * over it. The poster is a WebP, which the renderer cannot draw, so it reads a JPEG
 * made from the same frame.
 */
export default async function OpengraphImage() {
  const poster = await readFile(
    path.join(process.cwd(), "public/landing/og-poster.jpg")
  );
  const src = `data:image/jpeg;base64,${poster.toString("base64")}`;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#0b1410",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: rendered by the image generator, not a page */}
      <img
        src={src}
        alt=""
        width={1200}
        height={630}
        style={{ position: "absolute", inset: 0, objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(11,20,16,0.82), rgba(11,20,16,0.35) 70%, rgba(11,20,16,0.1))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 64,
          display: "flex",
          flexDirection: "column",
          color: "#f1ecdc",
        }}
      >
        <div
          style={{
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: -0.5,
            marginBottom: 28,
          }}
        >
          aivia
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 500,
            letterSpacing: -2.5,
            lineHeight: 1,
          }}
        >
          Describe it.
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 500,
            letterSpacing: -2.5,
            lineHeight: 1,
          }}
        >
          Watch it get made.
        </div>
      </div>
    </div>,
    size
  );
}
