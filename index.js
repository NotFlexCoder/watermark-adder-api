import express from 'express'
import axios from 'axios'
import sharp from 'sharp'

const app = express()

app.get('/', async (req, res) => {
  const imageUrl = req.query.image
  if (!imageUrl) return res.status(400).send('Image URL is missing')

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const imageBuffer = Buffer.from(response.data)

    const raw = sharp(imageBuffer)
    const metadata = await raw.metadata()

    const { data: imageData } = await raw
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const transparentBuffer = Buffer.from(imageData)

    for (let i = 0; i < transparentBuffer.length; i += 4) {
      const r = transparentBuffer[i]
      const g = transparentBuffer[i + 1]
      const b = transparentBuffer[i + 2]

      if (r > 240 && g > 240 && b > 240) {
        transparentBuffer[i + 3] = 0
      }
    }

    const result = await sharp(transparentBuffer, {
      raw: {
        width: metadata.width,
        height: metadata.height,
        channels: 4
      }
    }).png().toBuffer()

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Disposition', 'attachment; filename=removed-bg.png')
    res.send(result)
  } catch {
    res.status(500).send('Error processing image')
  }
})

app.listen(3000)
