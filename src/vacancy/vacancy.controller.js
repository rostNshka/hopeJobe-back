import { Router } from 'express'
import { VacancyService } from './vacancy.service.js'
import { auth } from '../auth.middleware.js'

const router = Router()

const vacancyService = new VacancyService()

router.post('/', auth, (req, res) => {
  if (!req.body?.text?.length) {
    return res.status(400).json({ message: 'Text is required' })
  }
  const vacancy = vacancyService.createVacancy(req.body)
  return res.status(200).json(vacancy)
})

export const vacancyRouter = router