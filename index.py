from flask import Flask, request, send_file
from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO

app = Flask(__name__)

@app.route("/")
def watermark():
    image_url = request.args.get("image")
    text = request.args.get("text")

    if not image_url or not text:
        return "Missing image or text", 400

    try:
        response = requests.get(image_url)
        response.raise_for_status()

        base = Image.open(BytesIO(response.content)).convert("RGBA")
        width, height = base.size

        watermark_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(watermark_layer)

        font = ImageFont.load_default()
        text_width, text_height = draw.textsize(text, font)

        x = (width - text_width) // 2
        y = (height - text_height) // 2

        draw.text((x, y), text, font=font, fill=(255, 255, 255, 80))  # white, light opacity

        watermarked = Image.alpha_composite(base, watermark_layer)
        output = BytesIO()
        watermarked.convert("RGB").save(output, format="JPEG")
        output.seek(0)

        return send_file(output, mimetype="image/jpeg")
    except Exception as e:
        return str(e), 500
