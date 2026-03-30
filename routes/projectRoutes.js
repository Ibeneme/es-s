const express = require('express');
const router = express.Router();
const multer = require('multer');
const projectController = require('../controllers/projectController');

// Configure Multer for Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes
router.get('/', projectController.getProjects);
router.get('/:slug', projectController.getProjectBySlug);

// use upload.single('image') to intercept the 'image' field from FormData
router.post('/', upload.single('image'), projectController.createProject);
router.put('/:id', upload.single('image'), projectController.updateProject);

router.delete('/:id', projectController.deleteProject);

module.exports = router;