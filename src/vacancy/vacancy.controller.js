import { Router } from 'express'
import { VacancyService } from './vacancy.service.js'

const router = Router()

const vacancyService = new VacancyService()

router.post('/', (req, res) => {
  const vacancy = vacancyService.createVacancy(req.body)
  return res.status(200).json(vacancy)
})

export const vacancyRouter = router