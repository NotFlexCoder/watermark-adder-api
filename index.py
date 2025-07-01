from flask import Flask, request, send_file
from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO
import base64

app = Flask(__name__)

FONT_DATA = b'AAEAAAALAIAAAwAwT1MvMg8SCSkAAAC8AAAAYGNtYXAXGzCEAAABHAAAAFRnYXNwAAAAEAAAAXgAAAAIZ2x5ZhTb2jIAAAF4AAACcGhlYWQkEt1nAAADNAAAADZoaGVhB90GzgAAAzgAAAAkaG10eFEAAAAAAAM8AAAAMGxvY2EAZgAEAAADVAAAABRtYXhwAAwABAAA1wAAAAgbmFtZVRYKo0AAANkAAACUnBvc3QDcw3jAAADcAAAACBwcmVwZJoPpLcAAAQMAAAAOQABAAADUv9qAFoEAAAA//8AAgAAAAAAAAABAAADUv9qAFoEAAUAAAAAAAAAAAAAAAAAAAABAAADAAAAAwAAAAAAAAACAAACAAAAHgD+AAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAEAAAABAACAAAACAAAAAwAAABcAAQAAAAAAAwAAAAAAAAAAAAAAAgAAAAIAAAAAAAAAAQAAAAEAAABnAAAAAQAAAAAAZgAAAAEAAAAAAAEAEQAAAAEAAAAAAAIADgAtAAMAAQAAAF0AZQByAHMAaQBvAG4AIAA5AC4AMAAAAAcAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAA=='

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

        font_size = width // 20
        font_stream = BytesIO(base64.b64decode(FONT_DATA))
        font = ImageFont.truetype(font_stream, font_size)

        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (width - text_width) // 2
        y = (height - text_height) // 2

        draw.text((x, y), text, font=font, fill=(255, 255, 255, 90))

        watermarked = Image.alpha_composite(base, watermark_layer)
        output = BytesIO()
        watermarked.convert("RGB").save(output, format="JPEG")
        output.seek(0)

        return send_file(output, mimetype="image/jpeg")
    except Exception as e:
        return str(e), 500
