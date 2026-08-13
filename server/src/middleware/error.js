export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    const maxMb = Number(process.env.MAX_SOURCE_IMAGE_MB || 50);
    return res.status(400).json({
      message: `This source image is too large to process. Please use an image smaller than ${maxMb} MB.`
    });
  }
  if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: 'You can upload maximum 20 property photos' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with this value already exists', fields: err.keyValue });
  }

  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
}
