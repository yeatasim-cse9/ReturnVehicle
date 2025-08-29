export function requireRole(...allowed) {
  return (req, res, next) => {
    const role = req?.authUser?.role;
    if (!role) return res.status(401).json({ message: "Unauthorized" });
    if (!allowed.includes(role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
