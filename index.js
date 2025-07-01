import express from 'express'
import axios from 'axios'
import sharp from 'sharp'

const app = express()

app.get('/', async (req, res) => {
  const imageUrl = req.query.image
  const background = req.query.background === 'true'
  const extension = background ? 'png' : req.query.extension

  if (!imageUrl || (!background && !extension)) return res.status(400).send('Missing parameters')

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const imageBuffer = Buffer.from(response.data)

    if (background) {
      const raw = await sharp(imageBuffer)
        .resize({ fit: 'contain' })
        .removeAlpha()
        .flatten({ background: '#ffffff' })
        .toColourspace('b-w')
        .threshold(200)
        .toBuffer()

      const alpha = await sharp(imageBuffer)
        .resize({ fit: 'contain' })
        .ensureAlpha()
        .extractChannel('alpha')
        .toBuffer()

      const finalImage = await sharp(raw)
        .joinChannel(alpha)
        .png()
        .toBuffer()

      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Content-Disposition', 'attachment; filename=converted.png')
      return res.send(finalImage)
    }

    const converted = await sharp(imageBuffer)
      .toFormat(extension)
      .toBuffer()

    res.setHeader('Content-Type', `image/${extension}`)
    res.setHeader('Content-Disposition', `attachment; filename=converted.${extension}`)
    res.send(converted)
  } catch {
    res.status(500).send('Error processing image')
  }
})

app.listen(3000)
