const prisma = require('../prisma/prismaClient');

async function getAllSuppliers() {
  
  return await prisma.supplier.findMany({

    select: {
      supplier_id: true,
      supplier_name: true,
      contact_number: true,
      address: true
    },
    orderBy: { created_at: 'desc' },
  });
}

async function createSupplier(data) {
  // if (!data.supplier_name || !data.contact_number || !data.address) {
  //   throw new Error("All fields are required");
  // }
  return await prisma.supplier.create({ data });
}



module.exports = {
  getAllSuppliers,
  createSupplier
};