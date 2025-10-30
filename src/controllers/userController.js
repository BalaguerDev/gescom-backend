import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { findOrCreateUser } from "../services/userService.js";


/**
 * Devuelve el perfil del usuario autenticado
 * y lo crea en BD si no existía.
 */
export const getUserProfile = async (req, res) => {
  try {
    const auth0User = req.auth;

    const email =
      auth0User?.email ||
      auth0User?.payload?.email ||
      auth0User?.["https://schemas.openid.net/email"] ||
      auth0User?.["https://gescomm/email"];

    if (!email) {
      console.warn("⚠️ No se encontró email en el token Auth0");
    }

    const user = await findOrCreateUser({
      sub: auth0User.sub,
      email,
    });

    res.json({ user });
  } catch (error) {
    console.error("❌ Error al obtener perfil de usuario:", error);
    res.status(500).json({ error: "Error al obtener perfil de usuario" });
  }
};

export const updateUserConfig = async (req, res) => {
  try {

    
    const auth0User = req.auth;
    const {
      name,
      startPoint,
      endPoint,
      startTime,
      endTime,
      userImage
    } = req.body;

    console.log("🧠 Datos recibidos del frontend:", req.body);

    console.log("🔍 Buscando usuario con auth0Id:", auth0User.sub);

    const updatedUser = await prisma.user.update({
      where: { auth0Id: auth0User.sub },
      data: {
        name,
        startPoint,
        endPoint,
        startTime,
        endTime,
        userImage,
        hasConfigured: true,
      },
    });

    res.json({
      message: "✅ Configuración de usuario actualizada correctamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error al actualizar configuración de usuario:", error);
    res.status(500).json({ message: "Error al actualizar usuario", error: error.message });
  }
};