import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { namaSupplier, kontak, alamat, email } = body;

    if (!namaSupplier) {
      return NextResponse.json({ message: "Nama Supplier wajib diisi" }, { status: 400 });
    }

    // Buat supplier baru
    const newSupplier = await prisma.supplier.create({
      data: {
        namaSupplier,
        kontak,
        alamat,
        email,
      },
    });

    return NextResponse.json(
      { message: "Data supplier berhasil ditambahkan", supplier: newSupplier },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json({ message: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
