const express = require('express');
const router = express.Router();
const { getNotes, addNote, updateNote, deleteNote } = require('../controllers/notesController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/trip/:tripId').get(getNotes).post(addNote);
router.route('/:noteId').put(updateNote).delete(deleteNote);

module.exports = router;
