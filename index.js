const express = require("express");
const Jimp = require("jimp");

const app = express();

app.get("/", async (req, res) => {
  const imageUrl = req.query.image;
  const text = req.query.text;

  if (!imageUrl || !text) return res.status(400).send("Missing image or text");

  try {
    const image = await Jimp.read(imageUrl);
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

    image.getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
      if (err) return res.status(500).send("Error generating image");
      res.set("Content-Type", Jimp.MIME_JPEG);
      res.send(buffer);
    });
  } catch (err) {
    res.status(500).send("Invalid image URL or server error");
  }
});

module.exports = app;
