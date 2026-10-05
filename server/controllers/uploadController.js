// @desc    Handle response after successful file upload
// @route   POST /api/upload
// @access  Protected
exports.handleUploadResponse = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.status(200).json({
    message: 'Image uploaded successfully',
    url: req.file.path,
  });
};
