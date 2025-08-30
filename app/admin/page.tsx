"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/simple-backend-auth";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Eye,
  Users,
  FileText,
  Container,
  FileSpreadsheet,
  Plus,
  LogOut,
} from "lucide-react";
import { FileUpload } from "@/components/file-upload";
import { UserManagement } from "@/components/user-management";
import { UserMenu } from "@/components/user-menu";
import { RecordSheetManagement } from "@/components/record-sheet-management";
import { getAllRecordSheets } from "@/lib/record-sheets";
import toast from "react-hot-toast";

import { FumigationTracking as FumigationTrackingComponent } from "./fumigation-tracking";
import {
  Certificate,
  FumigationTracking,
  RecordSheetWithReadings,
  SafeUser,
} from "@/types";
import {
  fetchUsers,
  fetchCertificates,
  createCertificate,
  deleteCertificate,
  fetchFumigationTrackings,
  createFumigationTracking,
  uploadFile,
  deleteFumigationTracking,
  updateFumigationTracking,
  fetchRecordSheets,
} from "@/lib/api-client";
import { ProgressStatus } from "@/generated/prisma";

export default function AdminDashboard() {
  const { user, loading: authLoading, getAllUsers, logout } = useAuth();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [fumigationTrackings, setFumigationTrackings] = useState<
    FumigationTracking[]
  >([]);
  const [recordSheets, setRecordSheets] = useState<RecordSheetWithReadings[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Certificate form state
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [certName, setCertName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fumigation specific fields (for general certificate form - now only container/notice/WO/gassing)
  const [containerNumber, setContainerNumber] = useState("");
  const [noticeId, setNoticeId] = useState("");
  const [woNumber, setWoNumber] = useState("");
  const [gassingTime, setGassingTime] = useState("");

  // Fumigation tracking form state
  const [trackingContainerNumber, setTrackingContainerNumber] = useState("");
  const [trackingNoticeId, setTrackingNoticeId] = useState("");
  const [trackingWoNumber, setTrackingWoNumber] = useState("");
  const [trackingCompanyName, setTrackingCompanyName] = useState("");
  const [trackingCompanyEmail, setTrackingCompanyEmail] = useState("");
  const [trackingLocation, setTrackingLocation] = useState("");
  const [trackingGassingTime, setTrackingGassingTime] = useState("");
  const [trackingProgressStatus, setTrackingProgressStatus] =
    useState<FumigationTracking["progressStatus"]>("PENDING");
  const [trackingNotes, setTrackingNotes] = useState("");

  // Phytosanitary specific form state
  const [phytoRecipientEmail, setPhytoRecipientEmail] = useState("");
  const [phytoRecipientName, setPhytoRecipientName] = useState("");
  const [phytoLocation, setPhytoLocation] = useState("");
  const [phytoDescription, setPhytoDescription] = useState("");
  const [phytoContainerNumber, setPhytoContainerNumber] = useState("");
  const [phytoNoticeId, setPhytoNoticeId] = useState("");
  const [phytoWoNumber, setPhytoWoNumber] = useState("");
  const [phytoFile, setPhytoFile] = useState<File | null>(null);
  const [phytoFileUrl, setPhytoFileUrl] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [user, authLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Ambil semua data dari API secara paralel
      const [certs, trackings, users, sheets] = await Promise.all([
        fetchCertificates(),
        fetchFumigationTrackings(),
        fetchUsers(),
        fetchRecordSheets(""),
      ]);

      setCertificates(certs);
      setFumigationTrackings(trackings);
      setAllUsers(users);
      setRecordSheets(sheets);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let fileData = null;
      if (selectedFile) {
        fileData = await uploadFile(selectedFile);
      }

      const newCertData: Partial<Certificate> = {
        name: certName,
        recipientEmail,
        recipientName,
        issueDate: new Date(),
        status: "VALID",
        serviceType,
        location,
        description,
        fileUrl: fileData?.url,
        fileName: fileData?.fileName,
        fileSize: fileData?.fileSize,
        containerNumber:
          serviceType === "FUMIGATION" ? containerNumber : undefined,
        noticeId: serviceType === "FUMIGATION" ? noticeId : undefined,
        woNumber: serviceType === "FUMIGATION" ? woNumber : undefined,
        gassingTime:
          serviceType === "FUMIGATION"
            ? gassingTime
              ? new Date(gassingTime)
              : undefined
            : undefined,
      };

      const newCertFromApi = await createCertificate(newCertData);
      setCertificates([newCertFromApi, ...certificates]);

      // Reset form
      setRecipientEmail("");
      setRecipientName("");
      setCertName("");
      setServiceType("");
      setLocation("");
      setDescription("");
      setSelectedFile(null);
      setContainerNumber("");
      setNoticeId("");
      setWoNumber("");
      setGassingTime("");

      toast.success("Certificate uploaded successfully!");
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast.error("Error uploading certificate");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadPhytosanitary = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let fileData = null;
      if (phytoFile) {
        fileData = await uploadFile(phytoFile);
      } else {
        fileData = {
          url: phytoFileUrl,
          fileName: "Sertifikat Link",
          fileSize: 0,
        };
      }

      console.log("FILE DATA", fileData);

      const newCertData: Partial<Certificate> = {
        name: "Sertifikat Phytosanitary",
        recipientEmail: phytoRecipientEmail,
        recipientName: phytoRecipientName,
        issueDate: new Date(),
        status: "VALID",
        serviceType: "FUMIGATION",
        location: phytoLocation,
        description: phytoDescription,
        fileUrl: fileData?.url,
        fileName: fileData?.fileName,
        fileSize: fileData?.fileSize,
        containerNumber: phytoContainerNumber.toUpperCase(),
        noticeId: phytoNoticeId.toUpperCase(),
        woNumber: phytoWoNumber.toUpperCase(),
        phytosanitaryFileName: fileData?.fileName,
        phytosanitaryUrl: fileData?.url || phytoFileUrl || undefined,
        gassingTime:
          serviceType === "FUMIGATION"
            ? gassingTime
              ? new Date(gassingTime)
              : undefined
            : undefined,
      };

      const newCertFromApi = await createCertificate(newCertData);
      setCertificates([newCertFromApi, ...certificates]);

      // Reset form
      setPhytoRecipientEmail("");
      setPhytoRecipientName("");
      setPhytoLocation("");
      setPhytoDescription("");
      setPhytoContainerNumber("");
      setPhytoNoticeId("");
      setPhytoWoNumber("");
      setPhytoFile(null);
      setPhytoFileUrl("");

      toast.success("Certificate uploaded successfully!");
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast.error("Error uploading certificate");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;

    try {
      await deleteCertificate(id);
      setCertificates(certificates.filter((cert) => cert.id !== id));
      toast.success("Certificate deleted successfully!");
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast.error(`Error: ${(error as Error).message}`);
    }
  };

  const handleViewCertificate = (cert: Certificate) => {
    if (cert.fileUrl) {
      window.open(cert.fileUrl, "_blank");
    } else {
      toast.error(`Certificate "${cert.name}" does not have a file to view.`);
    }
  };

  // TRACKING
  const handleAddFumigationTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const newTrackingData: Partial<FumigationTracking> = {
        containerNumber: trackingContainerNumber.toUpperCase(),
        noticeId: trackingNoticeId.toUpperCase(),
        woNumber: trackingWoNumber.toUpperCase() || undefined,
        companyName: trackingCompanyName,
        companyEmail: trackingCompanyEmail,
        location: trackingLocation,
        gassingTime: trackingGassingTime
          ? new Date(trackingGassingTime)
          : undefined,
        progressStatus: trackingProgressStatus,
        notes: trackingNotes || undefined,
      };

      const newTrackingFromApi = await createFumigationTracking(
        newTrackingData
      );
      setFumigationTrackings([newTrackingFromApi, ...fumigationTrackings]);

      // Reset tracking form
      setTrackingContainerNumber("");
      setTrackingNoticeId("");
      setTrackingWoNumber("");
      setTrackingCompanyName("");
      setTrackingCompanyEmail("");
      setTrackingLocation("");
      setTrackingGassingTime("");
      setTrackingProgressStatus("PENDING");
      setTrackingNotes("");

      toast.success("Fumigation tracking added successfully!");
    } catch (error) {
      console.error("Error adding fumigation tracking:", error);
      toast.error("Error adding fumigation tracking");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateTracking = async (
    id: string,
    newStatus: ProgressStatus
  ) => {
    try {
      const updatedTracking = await updateFumigationTracking(id, {
        progressStatus: newStatus,
      });

      setFumigationTrackings((currentTrackings) =>
        currentTrackings.map((t) => (t.id === id ? updatedTracking : t))
      );

      toast.success("Tracking progress updated successfully!");
    } catch (error) {
      console.error("Error updating tracking progress:", error);
      toast.error(`Error: ${(error as Error).message}`);
    }
  };

  const handleDeleteTracking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fumigation tracking?"))
      return;

    try {
      await deleteFumigationTracking(id);

      setFumigationTrackings((currentTrackings) =>
        currentTrackings.filter((t) => t.id !== id)
      );

      toast.success("Fumigation tracking deleted successfully!");
    } catch (error) {
      console.error("Error deleting fumigation tracking:", error);
      toast.error(`Error: ${(error as Error).message}`);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen prana-light-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-prana-blue mx-auto"></div>
          <p className="mt-4 text-prana-gray">Loading...</p>
        </div>
      </div>
    );
  }

  const fumigationCertificates = certificates.filter(
    (cert) => cert.serviceType === "FUMIGATION"
  );

  return (
    <div className="min-h-screen prana-light-gray">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-prana-navy">
              Admin Dashboard
            </h1>
            <p className="text-prana-gray mt-2">
              Kelola sertifikat, tracking fumigasi, pengguna, dan record sheet
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={logout}
              variant="outline"
              className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-600 hover:text-white bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
            <UserMenu />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-prana-blue" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-prana-gray">
                    Total Sertifikat
                  </p>
                  <p className="text-2xl font-bold text-prana-navy">
                    {certificates.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Container className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-prana-gray">
                    Tracking Aktif
                  </p>
                  <p className="text-2xl font-bold text-prana-navy">
                    {
                      fumigationTrackings.filter((t) =>
                        ["GASSING", "AERATION"].includes(t.progressStatus || "")
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-prana-gray">
                    Phytosanitary
                  </p>
                  <p className="text-2xl font-bold text-prana-navy">
                    {
                      fumigationCertificates.filter(
                        (cert) => cert.phytosanitaryUrl
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-prana-gray">
                    Total Pengguna
                  </p>
                  <p className="text-2xl font-bold text-prana-navy">
                    {allUsers.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileSpreadsheet className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-prana-gray">
                    Record Sheet
                  </p>
                  <p className="text-2xl font-bold text-prana-navy">
                    {recordSheets.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="certificates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white">
            <TabsTrigger value="certificates" className="text-prana-navy">
              Manajemen Sertifikat
            </TabsTrigger>
            <TabsTrigger value="phytosanitary" className="text-prana-navy">
              Phytosanitary
            </TabsTrigger>
            <TabsTrigger value="fumigation" className="text-prana-navy">
              Tracking Fumigasi
            </TabsTrigger>
            <TabsTrigger value="users" className="text-prana-navy">
              Manajemen Pengguna
            </TabsTrigger>
            <TabsTrigger value="recordsheets" className="text-prana-navy">
              Record Sheet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="certificates" className="space-y-6">
            {/* Upload Certificate Form */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-prana-navy">
                  Upload Sertifikat Baru
                </CardTitle>
                <CardDescription>
                  Buat dan terbitkan sertifikat baru untuk pengguna dengan
                  upload file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadCertificate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipientEmail">Email Penerima</Label>
                      <Input
                        id="recipientEmail"
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        required
                        placeholder="user@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipientName">Nama Penerima</Label>
                      <Input
                        id="recipientName"
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        required
                        placeholder="PT. Contoh Perusahaan"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certName">Nama Sertifikat</Label>
                    <Input
                      id="certName"
                      type="text"
                      value={certName}
                      onChange={(e) => setCertName(e.target.value)}
                      required
                      placeholder="Fumigation Certificate"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Jenis Layanan</Label>
                      <Select
                        value={serviceType}
                        onValueChange={setServiceType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis layanan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FUMIGATION">Fumigasi</SelectItem>
                          <SelectItem value="CARGO_SURVEY">
                            Cargo Survey
                          </SelectItem>
                          <SelectItem value="MARINE_SURVEY">
                            Marine Survey
                          </SelectItem>
                          <SelectItem value="PRESHIPMENT">
                            Pre-shipment Inspection
                          </SelectItem>
                          <SelectItem value="INSURANCE">
                            Insurance Survey
                          </SelectItem>
                          <SelectItem value="QUALITY_CONTROL">
                            Quality Control
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Lokasi</Label>
                      <Input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Tanjung Perak Port"
                      />
                    </div>
                  </div>                  

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Deskripsi singkat layanan survei"
                      rows={3}
                    />
                  </div>

                  <FileUpload
                    onFileSelect={setSelectedFile}
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={10}
                    disabled={uploading}
                  />

                  <Button
                    type="submit"
                    disabled={uploading}
                    className="w-full md:w-auto bg-prana-navy hover:bg-prana-blue"
                  >
                    {uploading ? "Mengupload..." : "Upload Sertifikat"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Certificates Table */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-prana-navy">
                  Sertifikat yang Diterbitkan
                </CardTitle>
                <CardDescription>
                  Daftar semua sertifikat yang telah diterbitkan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {certificates.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-prana-gray">
                      Belum ada sertifikat yang diterbitkan
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-prana-gray uppercase tracking-wider">
                            Penerima
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-prana-gray uppercase tracking-wider">
                            Sertifikat
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-prana-gray uppercase tracking-wider">
                            Jenis Layanan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-prana-gray uppercase tracking-wider">
                            Tanggal Terbit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-prana-gray uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-prana-gray uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {certificates.map((cert) => (
                          <tr key={cert.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-prana-navy">
                                  {cert.recipientName}
                                </div>
                                <div className="text-sm text-prana-gray">
                                  {cert.recipientEmail}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-prana-navy">
                                {cert.name}
                              </div>
                              {cert.location && (
                                <div className="text-sm text-prana-gray">
                                  {cert.location}
                                </div>
                              )}
                              {cert.containerNumber && (
                                <div className="text-xs text-prana-blue font-mono">
                                  {cert.containerNumber}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-prana-navy">
                                {cert.serviceType === "FUMIGATION"
                                  ? "Fumigasi"
                                  : cert.serviceType || "General"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-prana-navy">
                                {new Date(cert.issueDate).toLocaleDateString(
                                  "id-ID"
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                variant={
                                  cert.status === "VALID"
                                    ? "default"
                                    : "destructive"
                                }
                                className={
                                  cert.status === "VALID"
                                    ? "bg-green-100 text-green-800"
                                    : ""
                                }
                              >
                                {cert.status === "VALID"
                                  ? "Valid"
                                  : "Tidak Valid"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewCertificate(cert)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteCertificate(cert.id)
                                  }
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phytosanitary" className="space-y-6">
            {/* New Phytosanitary Upload Form */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-prana-navy">
                  <Plus className="w-5 h-5 mr-2" />
                  Upload Sertifikat Phytosanitary Baru
                </CardTitle>
                <CardDescription>
                  Unggah sertifikat phytosanitary untuk fumigasi kontainer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleUploadPhytosanitary}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phytoRecipientEmail">
                        Email Penerima
                      </Label>
                      <Input
                        id="phytoRecipientEmail"
                        type="email"
                        value={phytoRecipientEmail}
                        onChange={(e) => setPhytoRecipientEmail(e.target.value)}
                        required
                        placeholder="user@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phytoRecipientName">Nama Penerima</Label>
                      <Input
                        id="phytoRecipientName"
                        type="text"
                        value={phytoRecipientName}
                        onChange={(e) => setPhytoRecipientName(e.target.value)}
                        required
                        placeholder="PT. Contoh Perusahaan"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phytoContainerNumber">
                        Nomor Kontainer
                      </Label>
                      <Input
                        id="phytoContainerNumber"
                        type="text"
                        value={phytoContainerNumber}
                        onChange={(e) =>
                          setPhytoContainerNumber(e.target.value.toUpperCase())
                        }
                        required
                        placeholder="TEMU1234567"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phytoNoticeId">Notice ID</Label>
                      <Input
                        id="phytoNoticeId"
                        type="text"
                        value={phytoNoticeId}
                        onChange={(e) =>
                          setPhytoNoticeId(e.target.value.toUpperCase())
                        }
                        required
                        placeholder="NOT-2023-001"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phytoWoNumber">Nomor WO</Label>
                      <Input
                        id="phytoWoNumber"
                        type="text"
                        value={phytoWoNumber}
                        onChange={(e) =>
                          setPhytoWoNumber(e.target.value.toUpperCase())
                        }
                        placeholder="WO-2023-001"
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phytoLocation">Lokasi</Label>
                    <Input
                      id="phytoLocation"
                      type="text"
                      value={phytoLocation}
                      onChange={(e) => setPhytoLocation(e.target.value)}
                      placeholder="Tanjung Perak Port"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phytoDescription">Deskripsi</Label>
                    <Textarea
                      id="phytoDescription"
                      value={phytoDescription}
                      onChange={(e) => setPhytoDescription(e.target.value)}
                      placeholder="Deskripsi singkat sertifikat phytosanitary"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>File Sertifikat Phytosanitary</Label>
                    <div className="space-y-2">
                      <FileUpload
                        onFileSelect={setPhytoFile}
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={10}
                        disabled={uploading}
                      />
                      <div className="text-center text-prana-gray">atau</div>
                      <Input
                        type="url"
                        value={phytoFileUrl}
                        onChange={(e) => setPhytoFileUrl(e.target.value)}
                        placeholder="https://link-ke-sertifikat-phytosanitary.com"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={uploading}
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                  >
                    {uploading
                      ? "Mengupload..."
                      : "Upload Sertifikat Phytosanitary"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-prana-navy">
                  Manajemen Sertifikat Phytosanitary
                </CardTitle>
                <CardDescription>
                  Kelola sertifikat phytosanitary untuk fumigasi kontainer
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fumigationCertificates.filter((cert) => cert.phytosanitaryUrl)
                  .length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-prana-gray">
                      Belum ada sertifikat phytosanitary
                    </p>
                    <p className="text-sm text-prana-gray mt-2">
                      Sertifikat phytosanitary akan muncul ketika Anda
                      menambahkan fumigasi dengan file phytosanitary
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-prana-gray uppercase tracking-wider">
                            Container
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-prana-gray uppercase tracking-wider">
                            Penerima
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-prana-gray uppercase tracking-wider">
                            Notice ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-prana-gray uppercase tracking-wider">
                            Tanggal
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-prana-gray uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-prana-gray uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fumigationCertificates
                          .filter((cert) => cert.phytosanitaryUrl)
                          .map((cert) => (
                            <tr key={cert.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-prana-navy font-mono">
                                    {cert.containerNumber}
                                  </div>
                                  <div className="text-sm text-prana-gray">
                                    {cert.location}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-prana-navy">
                                    {cert.recipientName}
                                  </div>
                                  <div className="text-sm text-prana-gray">
                                    {cert.recipientEmail}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-prana-navy font-mono">
                                  {cert.noticeId}
                                </div>
                                <div className="text-sm text-prana-gray">
                                  WO: {cert.woNumber}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-prana-navy">
                                  {new Date(cert.issueDate).toLocaleDateString(
                                    "id-ID"
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className="bg-green-100 text-green-800">
                                  Valid
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open(
                                        cert?.phytosanitaryUrl ?? "#",
                                        "_blank"
                                      )
                                    }
                                    className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteCertificate(cert.id)
                                    }
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fumigation" className="space-y-6">
            {/* Add New Fumigation Tracking Form */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-prana-navy">
                  <Plus className="w-5 h-5 mr-2" />
                  Tambah Tracking Fumigasi Baru
                </CardTitle>
                <CardDescription>
                  Input data tracking fumigasi secara manual untuk monitoring
                  user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleAddFumigationTracking}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="trackingCompanyEmail">
                        Email Perusahaan
                      </Label>
                      <Input
                        id="trackingCompanyEmail"
                        type="email"
                        value={trackingCompanyEmail}
                        onChange={(e) =>
                          setTrackingCompanyEmail(e.target.value)
                        }
                        required
                        placeholder="user@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trackingCompanyName">
                        Nama Perusahaan
                      </Label>
                      <Input
                        id="trackingCompanyName"
                        type="text"
                        value={trackingCompanyName}
                        onChange={(e) => setTrackingCompanyName(e.target.value)}
                        required
                        placeholder="PT. Contoh Perusahaan"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="trackingContainerNumber">
                        Nomor Kontainer
                      </Label>
                      <Input
                        id="trackingContainerNumber"
                        type="text"
                        value={trackingContainerNumber}
                        onChange={(e) =>
                          setTrackingContainerNumber(
                            e.target.value.toUpperCase()
                          )
                        }
                        required
                        placeholder="TEMU1234567"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trackingNoticeId">Notice ID</Label>
                      <Input
                        id="trackingNoticeId"
                        type="text"
                        value={trackingNoticeId}
                        onChange={(e) =>
                          setTrackingNoticeId(e.target.value.toUpperCase())
                        }
                        required
                        placeholder="NOT-2023-001"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trackingWoNumber">Nomor WO</Label>
                      <Input
                        id="trackingWoNumber"
                        type="text"
                        value={trackingWoNumber}
                        onChange={(e) =>
                          setTrackingWoNumber(e.target.value.toUpperCase())
                        }
                        placeholder="WO-2023-001"
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="trackingLocation">Lokasi</Label>
                      <Input
                        id="trackingLocation"
                        type="text"
                        value={trackingLocation}
                        onChange={(e) => setTrackingLocation(e.target.value)}
                        required
                        placeholder="Tanjung Perak Port"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trackingProgressStatus">
                        Status Progress
                      </Label>
                      <Select
                        value={trackingProgressStatus}
                        onValueChange={(value) =>
                          setTrackingProgressStatus(
                            value as FumigationTracking["progressStatus"]
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status progress" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Menunggu</SelectItem>
                          <SelectItem value="GASSING">
                            Proses Gassing
                          </SelectItem>
                          <SelectItem value="AERATION">
                            Proses Aerasi
                          </SelectItem>
                          <SelectItem value="READY">Siap Keluar</SelectItem>
                          <SelectItem value="COMPLETED">Selesai</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trackingGassingTime">Waktu Gassing</Label>
                    <Input
                      id="trackingGassingTime"
                      type="datetime-local"
                      value={trackingGassingTime}
                      onChange={(e) => setTrackingGassingTime(e.target.value)}
                    />
                    <p className="text-xs text-prana-gray">
                      Estimasi kontainer siap keluar: 27 jam setelah waktu
                      gassing
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trackingNotes">Catatan</Label>
                    <Textarea
                      id="trackingNotes"
                      value={trackingNotes}
                      onChange={(e) => setTrackingNotes(e.target.value)}
                      placeholder="Catatan tambahan tentang proses fumigasi"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={uploading}
                    className="w-full md:w-auto bg-prana-navy hover:bg-prana-blue"
                  >
                    {uploading ? "Menambahkan..." : "Tambah Tracking Fumigasi"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Fumigation Tracking Management */}
            <FumigationTrackingComponent
              trackings={fumigationTrackings}
              onUpdate={handleUpdateTracking}
              onDelete={handleDeleteTracking}
            />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="recordsheets">
            <RecordSheetManagement
              certificateId=""
              commodity=""
              containerNumber=""
              certificates={certificates}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
