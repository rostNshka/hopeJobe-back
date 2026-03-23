import express from 'express'

const app = express()

async function main() {
  app.use(express.json())

  app.get('/api', (req, res) => {
    res.status(200).json({
      message: 'Hello World!',
    })
  })

  app.listen(4200, () => console.log(`Server started on port 4200`))
}

main()