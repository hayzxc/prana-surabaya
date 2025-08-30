import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { withAdminAuth } from "@/lib/auth-middleware";

export const POST = withAdminAuth(async (request) => {
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json(
      { success: false, message: "No file uploaded" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Buat nama file unik untuk menghindari tumpang tindih
  const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
  // Simpan file di direktori public/uploads
  const filepath = path.join(process.cwd(), "public/uploads", filename);

  try {
    await writeFile(filepath, buffer);

    // Kembalikan URL publik, nama file, dan ukuran
    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`, // URL yang bisa diakses dari browser
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json(
      { success: false, message: "Error saving file" },
      { status: 500 }
    );
  }
});
