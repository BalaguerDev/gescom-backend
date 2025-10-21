export const getUserProfile = (req, res) => {
  // req.user viene del middleware checkJwt
  res.json({
    message: "✅ Usuario autenticado correctamente",
    user: req.user,
  });
};
