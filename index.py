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
        scale = width // 10
        factor = scale // 6
        text_img = Image.new("L", (factor * len(text), factor + 10))
        text_draw = ImageDraw.Draw(text_img)
        text_draw.text((0, 0), text, font=font, fill=255)
        text_img = text_img.resize((width // 2, height // 15))
        x = (width - text_img.width) // 2
        y = (height - text_img.height) // 2

        text_colored = Image.new("RGBA", text_img.size, (255, 255, 255, 80))
        text_colored.putalpha(text_img)

        watermark_layer.paste(text_colored, (x, y), text_colored)
        watermarked = Image.alpha_composite(base, watermark_layer)

        output = BytesIO()
        watermarked.convert("RGB").save(output, format="JPEG")
        output.seek(0)
        return send_file(output, mimetype="image/jpeg")

    except Exception as e:
        return str(e), 500
