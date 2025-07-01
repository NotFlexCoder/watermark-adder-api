import express from 'express'
import axios from 'axios'
import sharp from 'sharp'

const app = express()

app.get('/', async (req, res) => {
  const imageUrl = req.query.image
  const extension = req.query.extension

  if (!imageUrl || !extension) return res.status(400).send('Missing parameters')

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const imageBuffer = Buffer.from(response.data)

    const converted = await sharp(imageBuffer).toFormat(extension).toBuffer()
    res.setHeader('Content-Type', `image/${extension}`)
    res.setHeader('Content-Disposition', `attachment; filename=converted.${extension}`)
    res.send(converted)
  } catch (err) {
    res.status(500).send('Error processing image')
  }
})

app.listen(3000)
