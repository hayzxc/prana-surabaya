import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth, withAuth, type AuthUser } from "@/lib/auth-middleware";

// GET: Mengambil semua sertifikat
export const GET = withAuth(async (request, user) => {
  const queryOptions: any = {
    orderBy: { issueDate: "desc" },
    include: {
      issuedBy: { select: { id: true, name: true, email: true } },
    },
  };

  if (user.role !== "ADMIN") {
    queryOptions.where = {
      recipientEmail: user.email,
    };
  }

  const certificates = await prisma.certificate.findMany(queryOptions);
  return NextResponse.json({ success: true, data: certificates });
});

// POST: Membuat sertifikat baru
export const POST = withAdminAuth(async (request, user: AuthUser) => {
  const body = await request.json();

  const { gassingTime, serviceType, ...restOfBody } = body;
  const newCertData: any = { ...restOfBody, issuedById: user.id };

  if (gassingTime && serviceType === "FUMIGATION") {
    const gassingDate = new Date(gassingTime);
    newCertData.gassingTime = gassingDate;
    newCertData.aerationStartTime = gassingDate;

    // Tambah 27 jam untuk container ready time
    const readyDate = new Date(gassingDate.getTime() + 27 * 60 * 60 * 1000);
    newCertData.containerReadyTime = readyDate;

    newCertData.progressStatus = "GASSING";
  }

  console.log("Service Type", serviceType);

  const certificate = await prisma.certificate.create({
    data: {
      ...newCertData,
      serviceType: serviceType,
    },
  });

  return NextResponse.json(
    { success: true, data: certificate },
    { status: 201 }
  );
});
