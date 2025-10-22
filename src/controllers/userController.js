export const getUserProfile = (req, res) => {
  res.json({
    message: "✅ Usuario autenticado correctamente",
    user: req.user,
  });
};
