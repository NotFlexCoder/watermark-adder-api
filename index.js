import express from 'express'
import axios from 'axios'
import sharp from 'sharp'

const app = express()

app.get('/', async (req, res) => {
  const imageUrl = req.query.image
  let extension = req.query.extension
  const background = req.query.background === 'true'

  if (!imageUrl || !extension) return res.status(400).send('Missing parameters')

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const imageBuffer = Buffer.from(response.data)

    if (background) {
      extension = 'png'

      const converted = await sharp(imageBuffer)
        .removeAlpha()
        .flatten({ background: '#ffffff' })
        .threshold(240)
        .ensureAlpha()
        .toFormat(extension)
        .toBuffer()

      res.setHeader('Content-Type', `image/${extension}`)
      res.setHeader('Content-Disposition', `attachment; filename=converted.${extension}`)
      return res.send(converted)
    }

    const converted = await sharp(imageBuffer)
      .toFormat(extension)
      .toBuffer()

    res.setHeader('Content-Type', `image/${extension}`)
    res.setHeader('Content-Disposition', `attachment; filename=converted.${extension}`)
    res.send(converted)
  } catch (err) {
    res.status(500).send('Error processing image')
  }
})

app.listen(3000)
