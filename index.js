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
      const converted = await sharp(imageBuffer)
        .removeAlpha()
        .flatten({ background: '#ffffff' })
        .threshold(240)
        .ensureAlpha()
        .toFormat('png')
        .toBuffer()

      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Content-Disposition', 'attachment; filename=converted.png')
      return res.send(converted)
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
