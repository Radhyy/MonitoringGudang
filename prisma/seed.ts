import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Hash passwords
  const hashedPassword = await bcrypt.hash("password123", 12);

  // Buat user owner
  const owner = await prisma.user.upsert({
    where: { email: "owner@gudang.com" },
    update: {},
    create: {
      name: "Owner Gudang",
      email: "owner@gudang.com",
      password: hashedPassword,
      role: "OWNER",
    },
  });

  // Buat user admin gudang
  const admin = await prisma.user.upsert({
    where: { email: "admin@gudang.com" },
    update: {},
    create: {
      name: "Admin Gudang",
      email: "admin@gudang.com",
      password: hashedPassword,
      role: "ADMIN_GUDANG",
    },
  });

  // Buat user karyawan
  const karyawan = await prisma.user.upsert({
    where: { email: "karyawan@gudang.com" },
    update: {},
    create: {
      name: "Tim Karyawan",
      email: "karyawan@gudang.com",
      password: hashedPassword,
      role: "KARYAWAN",
    },
  });

  console.log("✅ Seed berhasil!");
  console.log("📋 Akun yang dibuat:");
  console.log(`   OWNER        → owner@gudang.com    / password123`);
  console.log(`   ADMIN GUDANG → admin@gudang.com    / password123`);
  console.log(`   KARYAWAN     → karyawan@gudang.com / password123`);
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
