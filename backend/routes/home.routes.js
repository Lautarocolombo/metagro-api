const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth.middleware')
const homeController = require('../controllers/home.controller')

router.get('/home-content', auth, homeController.getHomeContent)
router.post('/home-content', auth, homeController.postHomeContent)
router.get('/home-content/history', auth, homeController.getHomeContentHistory)
router.post('/home-content/restore', auth, homeController.restoreHomeContent)

module.exports = router
