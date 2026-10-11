import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/libs/password";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin12345";
const USER_EMAIL = "user@example.com";
const USER_PASSWORD = "User12345";

const categories = [
  { name: "Electrónica", description: "Equipos, accesorios y gadgets" },
  { name: "Hogar", description: "Todo para la casa" },
  { name: "Libros", description: "Programación, diseño y más" },
  { name: "Deportes", description: "Ropa y equipamiento deportivo" },
];

const productNames: Record<string, string[]> = {
  Electrónica: [
    "Teclado mecánico",
    "Mouse inalámbrico",
    "Monitor 27 pulgadas",
    "Audífonos con cancelación de ruido",
    "Webcam Full HD",
    "Hub USB-C",
    "Micrófono de condensador",
  ],
  Hogar: [
    "Lámpara de escritorio",
    "Silla ergonómica",
    "Cafetera de goteo",
    "Organizador de cables",
    "Planta de interior",
  ],
  Libros: [
    "Clean Code",
    "The Pragmatic Programmer",
    "Diseño de sistemas",
    "JavaScript: The Good Parts",
    "Refactoring",
    "Domain-Driven Design",
  ],
  Deportes: [
    "Mat de yoga",
    "Mancuernas ajustables",
    "Botella térmica",
    "Cuerda para saltar",
    "Zapatillas para correr",
    "Banda elástica",
  ],
};

async function main() {
  // Usuarios: el seed no sobrescribe contraseñas existentes
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "ADMIN" },
    create: {
      email: ADMIN_EMAIL,
      name: "Administrador",
      password: await hashPassword(ADMIN_PASSWORD),
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: {},
    create: {
      email: USER_EMAIL,
      name: "Usuario Demo",
      password: await hashPassword(USER_PASSWORD),
      role: "USER",
      emailVerified: new Date(),
    },
  });

  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    categoryIds.set(saved.name, saved.id);
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    let i = 0;
    const data = Object.entries(productNames).flatMap(([category, names]) =>
      names.map((name) => {
        i += 1;
        return {
          name,
          description: `${name} de ejemplo para la categoría ${category}.`,
          price: ((i * 37) % 450) + 9.9,
          stock: (i * 7) % 60,
          categoryId: categoryIds.get(category),
        };
      }),
    );
    await prisma.product.createMany({ data });
  }

  console.log("Seed completado:");
  console.log(`  Admin:   ${admin.email} / ${process.env.SEED_ADMIN_PASSWORD ? "(SEED_ADMIN_PASSWORD)" : ADMIN_PASSWORD}`);
  console.log(`  Usuario: ${USER_EMAIL} / ${USER_PASSWORD}`);
  console.log(`  Categorías: ${categories.length}, productos: ${await prisma.product.count()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
