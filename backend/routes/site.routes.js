const express = require('express')
const router = express.Router()
const siteController = require('../controllers/site.controller')

router.get('/site-texts', siteController.getSiteTexts)
router.put('/site-texts/:key', siteController.updateSiteText)
router.post('/site-changes', siteController.createSiteChange)
router.get('/site-changes', siteController.getSiteChanges)

module.exports = router
