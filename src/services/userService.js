import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

/**
 * Busca un usuario por auth0Id. Si no existe, lo crea con objetivos fake.
 */
export const findOrCreateUser = async ({ sub, email }) => {
  let user = await prisma.user.findUnique({
    where: { auth0Id: sub },
  });

  if (!user) {
    console.log("🆕 Creando nuevo usuario en BD con:", { sub, email });

    user = await prisma.user.create({
      data: {
        auth0Id: sub,
        email,
        name: "Usuario",
        objetivos: generateFakeObjetivos(), // ✅ una sola llamada
        hasConfigured: false,
      },
    });
  }

  return user;
};

function generateFakeObjetivos() {
  const familias = ["maquinas", "herramienta", "accesorios"];
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];

  const objetivos = {};
  familias.forEach((familia) => {
    objetivos[familia] = {};
    meses.forEach((mes) => {
      objetivos[familia][mes] = faker.number.int({ min: 3000, max: 15000 });
    });
  });
  return objetivos;
}
