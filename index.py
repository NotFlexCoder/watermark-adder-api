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
        if response.status_code != 200:
            return "Image not accessible", 400

        image = Image.open(BytesIO(response.content)).convert("RGB")
        draw = ImageDraw.Draw(image)

        font = ImageFont.load_default()
        width, height = image.size
        text_width, text_height = draw.textsize(text, font)
        x = 10
        y = height - text_height - 10

        draw.text((x, y), text, font=font, fill=(255, 255, 255))

        output = BytesIO()
        image.save(output, format="JPEG")
        output.seek(0)
        return send_file(output, mimetype="image/jpeg")

    except Exception as e:
        return "Server error", 500
