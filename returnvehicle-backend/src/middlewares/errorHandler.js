export function notFound(_req, res, _next) {
  res.status(404).json({ message: "Not Found" });
}

export function errorHandler(err, _req, res, _next) {
  console.error("❌ Error:", err);
  const status =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err?.message || "Server Error",
  });
}
