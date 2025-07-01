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

        image = Image.open(BytesIO(response.content)).convert("RGB")
        draw = ImageDraw.Draw(image)

        font = ImageFont.load_default()

        width, height = image.size
        x = 10
        y = height - 20

        draw.text((x, y), text, font=font, fill=(255, 255, 255))

        output = BytesIO()
        image.save(output, format="JPEG")
        output.seek(0)

        return send_file(output, mimetype="image/jpeg")
    except Exception as e:
        return "Server error", 500
