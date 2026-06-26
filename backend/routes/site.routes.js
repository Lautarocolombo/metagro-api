const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth.middleware')
const siteController = require('../controllers/site.controller')

router.get('/site-texts', siteController.getSiteTexts)
router.put('/site-texts/:key', auth, siteController.updateSiteText)
router.post('/site-changes', siteController.createSiteChange)
router.get('/site-changes', siteController.getSiteChanges)
router.get('/analytics/dashboard', auth, siteController.getDashboard)
router.get('/analytics/top-searches', siteController.getTopSearches)
router.get('/translations', siteController.getTranslations)
router.post('/translations/batch', auth, siteController.batchUpdateTranslations)

module.exports = router
