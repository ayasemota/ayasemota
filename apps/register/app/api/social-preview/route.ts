import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const CANDIDATE_IMAGE_PATHS = [
  path.resolve(process.cwd(), "../../packages/assets/social-preview.png"),
  path.resolve(process.cwd(), "packages/assets/social-preview.png"),
];

async function readSocialPreviewImage(): Promise<Buffer> {
  for (const imagePath of CANDIDATE_IMAGE_PATHS) {
    try {
      return await readFile(imagePath);
    } catch {
      // Try the next candidate path.
    }
  }

  throw new Error("Missing packages/assets/social-preview.png");
}

export async function GET() {
  try {
    const imageBuffer = await readSocialPreviewImage();
    const imageBytes = new Uint8Array(imageBuffer);

    return new NextResponse(imageBytes, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Social preview image unavailable" },
      { status: 500 },
    );
  }
}
