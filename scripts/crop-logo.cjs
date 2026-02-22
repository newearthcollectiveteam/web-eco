const sharp = require("sharp");
const path = require("path");

async function cropLogo() {
  const inputPath = "/Users/matthewmiceli/Downloads/golden-logo-on-black.png";
  const outputPath = path.join(
    __dirname,
    "../public/brand/golden-text-logo.png"
  );

  try {
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log("Original dimensions:", metadata.width, "x", metadata.height);

    // The symbol is on the left, text is on the right
    // For a 2000x1000 image, the symbol is roughly in the first 300-400px
    // Start cropping after the symbol (around 450px to be safe)
    const cropLeft = 450;
    const cropWidth = metadata.width - cropLeft;

    // First extract the text portion
    const textBuffer = await sharp(inputPath)
      .extract({
        left: cropLeft,
        top: 0,
        width: cropWidth,
        height: metadata.height,
      })
      .toBuffer();

    // Then trim to remove excess black space and save
    await sharp(textBuffer).trim({ threshold: 10 }).toFile(outputPath);

    console.log("✅ Cropped logo saved to:", outputPath);

    // Get final dimensions
    const finalMetadata = await sharp(outputPath).metadata();
    console.log(
      "Final dimensions:",
      finalMetadata.width,
      "x",
      finalMetadata.height
    );
  } catch (error) {
    console.error("Error cropping logo:", error);
    process.exit(1);
  }
}

cropLogo();
