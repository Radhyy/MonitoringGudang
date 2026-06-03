const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const barang = await prisma.barang.findMany({take: 5, orderBy: {createdAt: 'desc'}});
  const produk = await prisma.produk.findMany({take: 5, orderBy: {createdAt: 'desc'}});
  console.log('--- BARANG TERAKHIR ---', barang);
  console.log('--- PRODUK TERAKHIR ---', produk);
}

main().finally(() => prisma.$disconnect());
