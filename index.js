import express from "express";
import Jimp from "jimp";
import fetch from "node-fetch";

const app = express();

app.get("/", async (req, res) => {
  const imageUrl = req.query.image;
  const text = req.query.text;

  if (!imageUrl || !text) return res.status(400).send("Missing image or text");

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return res.status(400).send("Image not accessible");

    const buffer = await response.buffer();
    const image = await Jimp.read(buffer);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    image.print(
      font,
      10,
      image.getHeight() - 50,
      {
        text: text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
        alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
      },
      image.getWidth() - 20,
      50
    );

    const result = await image.getBufferAsync(Jimp.MIME_JPEG);
    res.set("Content-Type", Jimp.MIME_JPEG);
    res.send(result);
  } catch (err) {
    res.status(500).send("Server error or invalid image");
  }
});

export default app;
