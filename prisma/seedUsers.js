import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Eliminando usuarios antiguos...");
  await prisma.user.deleteMany();

  console.log("🚀 Generando usuario de prueba con objetivos...");

  const familias = ['maquinas', 'herramientas', 'accesorios'];
  const meses = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'
  ];

  const objetivos = {};

  familias.forEach(fam => {
    objetivos[fam] = {};
    meses.forEach(mes => {
      objetivos[fam][mes] = faker.number.int({ min: 2000, max: 15000 });
    });
  });

  await prisma.user.create({
    data: {
      auth0Id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      startPoint: faker.location.city(),
      startTime: '08:30',
      endPoint: faker.location.city(),
      endTime: '18:00',
      objetivos,
      hasConfigured: true,
    },
  });

  console.log("✅ Usuario creado con objetivos mensuales por familia.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
