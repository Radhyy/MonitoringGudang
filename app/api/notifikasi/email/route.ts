import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, barangHabis, barangMenipis } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email penerima harus diisi" }, { status: 400 });
    }

    // Konfigurasi transporter nodemailer menggunakan SMTP Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    // Validasi konfigurasi SMTP
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.error("Missing EMAIL_USER or EMAIL_APP_PASSWORD in .env");
      return NextResponse.json(
        { message: "Server belum dikonfigurasi untuk mengirim email. Hubungi admin/developer (Missing env vars)." },
        { status: 500 }
      );
    }

    // Format email menggunakan HTML
    let emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f8fafc; padding: 20px; border-bottom: 1px solid #e2e8f0; text-align: center;">
          <h2 style="color: #0f172a; margin: 0;">Laporan Stok Kritis - GudangKu</h2>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">${new Date().toLocaleString('id-ID')}</p>
        </div>
        <div style="padding: 20px;">
          <p>Halo Tim Packing,</p>
          <p>Berikut adalah laporan status barang baku di gudang yang membutuhkan perhatian segera untuk proses produksi selanjutnya.</p>
    `;

    if (barangHabis.length > 0) {
      emailHtml += `
        <h3 style="color: #dc2626; margin-top: 24px; border-bottom: 2px solid #fecaca; padding-bottom: 4px;">🛑 Stok HABIS (0)</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #fef2f2; text-align: left;">
              <th style="padding: 8px; border: 1px solid #fca5a5;">Nama Barang</th>
              <th style="padding: 8px; border: 1px solid #fca5a5;">Batas Minimum</th>
            </tr>
          </thead>
          <tbody>
      `;
      barangHabis.forEach((b: any) => {
        emailHtml += `
            <tr>
              <td style="padding: 8px; border: 1px solid #fca5a5; font-weight: bold;">${b.namaBarang} <span style="font-size:11px; color:#6b7280;">(${b.kodeBarang})</span></td>
              <td style="padding: 8px; border: 1px solid #fca5a5;">${b.stokMinimum} ${b.satuan}</td>
            </tr>
        `;
      });
      emailHtml += `</tbody></table>`;
    }

    if (barangMenipis.length > 0) {
      emailHtml += `
        <h3 style="color: #d97706; margin-top: 24px; border-bottom: 2px solid #fde68a; padding-bottom: 4px;">⚠️ Stok MENIPIS (Kritis)</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #fffbeb; text-align: left;">
              <th style="padding: 8px; border: 1px solid #fcd34d;">Nama Barang</th>
              <th style="padding: 8px; border: 1px solid #fcd34d;">Sisa Stok</th>
              <th style="padding: 8px; border: 1px solid #fcd34d;">Batas Minimum</th>
            </tr>
          </thead>
          <tbody>
      `;
      barangMenipis.forEach((b: any) => {
        emailHtml += `
            <tr>
              <td style="padding: 8px; border: 1px solid #fcd34d; font-weight: bold;">${b.namaBarang} <span style="font-size:11px; color:#6b7280;">(${b.kodeBarang})</span></td>
              <td style="padding: 8px; border: 1px solid #fcd34d; color: #d97706; font-weight: bold;">${b.stok} ${b.satuan}</td>
              <td style="padding: 8px; border: 1px solid #fcd34d;">${b.stokMinimum} ${b.satuan}</td>
            </tr>
        `;
      });
      emailHtml += `</tbody></table>`;
    }

    emailHtml += `
          <p style="margin-top: 30px;">Harap segera hubungi Admin Gudang / Supplier untuk melakukan pemesanan ulang (*restock*).</p>
        </div>
        <div style="background-color: #1e293b; color: #94a3b8; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Email ini dikirim otomatis oleh Sistem Monitoring GudangKu.</p>
        </div>
      </div>
    `;

    // Pengaturan pesan email
    const mailOptions = {
      from: `"GudangKu System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🚨 [GudangKu] Alert! Laporan Stok Bahan Baku Kritis`,
      html: emailHtml,
    };

    // Eksekusi pengiriman
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Email berhasil dikirim" }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ message: "Gagal mengirim email: " + (error.message || "Unknown Error") }, { status: 500 });
  }
}
