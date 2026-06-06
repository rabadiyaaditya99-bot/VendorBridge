const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // Clear existing logs & transactions (safest order)
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.rFQVendor.deleteMany();
  await prisma.rFQ.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  console.log("Existing data cleared.");

  // Password hashing
  const adminPassword = await bcrypt.hash("admin123", 12);
  const procurementPassword = await bcrypt.hash("procurement123", 12);
  const managerPassword = await bcrypt.hash("manager123", 12);
  const vendorPassword = await bcrypt.hash("vendor123", 12);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@admin.com",
      username: "admin",
      phone: "9999999999",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const procurement = await prisma.user.create({
    data: {
      name: "Procurement Officer",
      email: "procurement@vendorbridge.com",
      username: "procurement",
      phone: "8888888888",
      password: procurementPassword,
      role: "PROCUREMENT_OFFICER",
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Manager User",
      email: "manager@vendorbridge.com",
      username: "manager",
      phone: "7777777777",
      password: managerPassword,
      role: "MANAGER",
    },
  });

  const vendorUser = await prisma.user.create({
    data: {
      name: "Active Crop Vendor",
      email: "vendor@vendorbridge.com",
      username: "vendor",
      phone: "6666666666",
      password: vendorPassword,
      role: "VENDOR",
    },
  });

  console.log("Users seeded successfully.");

  // 2. Create Vendor Profile for Vendor User
  const vendorProfile = await prisma.vendor.create({
    data: {
      companyName: "Acme Corporation",
      contactPerson: "John Doe",
      email: "vendor@vendorbridge.com",
      phone: "6666666666",
      gstNumber: "27AAAAA1111A1Z1",
      category: "IT Equipment",
      address: "123 Technology Way",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      status: "ACTIVE",
      rating: 4.5,
    },
  });

  // Create another inactive vendor
  const inactiveVendor = await prisma.vendor.create({
    data: {
      companyName: "Global Logistics",
      contactPerson: "Jane Smith",
      email: "logistics@global.com",
      phone: "5555555555",
      gstNumber: "27BBBBB2222B2Z2",
      category: "Logistics Services",
      address: "456 Shipping Blvd",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      status: "PENDING",
      rating: 0.0,
    },
  });

  console.log("Vendor profiles seeded successfully.");

  // 3. Create Sample RFQ
  const rfq = await prisma.rFQ.create({
    data: {
      title: "Procurement of Laptops for Engineering Team",
      description: "We require 15 high-performance laptops with 32GB RAM and 1TB SSD.",
      itemName: "Developer Laptops",
      quantity: 15,
      unit: "Units",
      category: "IT Equipment",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: "SENT",
      createdById: procurement.id,
    },
  });

  // Assign vendor to RFQ
  await prisma.rFQVendor.create({
    data: {
      rfqId: rfq.id,
      vendorId: vendorProfile.id,
    },
  });

  console.log("Sample RFQs and assignments seeded successfully.");
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
