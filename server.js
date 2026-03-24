import express from 'express'
import { vacancyRouter } from './src/vacancy/vacancy.controller.js'

const app = express()

async function main() {
  app.use(express.json())

  app.get('/api', vacancyRouter)

  app.all(/.*/, (req, res) => {
    res.status(404).json({ message: 'Not Found' })
  })

  app.listen(4200, () => console.log(`Server started on port 4200`))
}

main()