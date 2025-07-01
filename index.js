import express from 'express'
import axios from 'axios'
import sharp from 'sharp'

const app = express()

app.get('/', async (req, res) => {
  const imageUrl = req.query.image
  const extension = req.query.extension
  const background = req.query.background === 'true'

  if (!imageUrl || !extension) return res.status(400).send('Missing parameters')

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    let imageBuffer = Buffer.from(response.data)
    let image = sharp(imageBuffer)

    if (background) {
      image = image
        .removeAlpha()
        .flatten({ background: '#ffffff' })
        .threshold(240)
        .toColourspace('b-w')
        .toBuffer()
        .then(mask =>
          sharp(imageBuffer)
            .ensureAlpha()
            .composite([
              {
                input: mask,
                raw: {
                  width: (await sharp(imageBuffer).metadata()).width,
                  height: (await sharp(imageBuffer).metadata()).height,
                  channels: 1
                },
                blend: 'dest-in'
              }
            ])
            .toFormat(extension)
            .toBuffer()
        )
    } else {
      image = image.toFormat(extension).toBuffer()
    }

    const converted = await image
    res.setHeader('Content-Type', `image/${extension}`)
    res.setHeader('Content-Disposition', `attachment; filename=converted.${extension}`)
    res.send(converted)
  } catch {
    res.status(500).send('Error processing image')
  }
})

app.listen(3000)
