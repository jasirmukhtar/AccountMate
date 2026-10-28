const prisma = require('../prisma/prismaClient');

async function createTransaction(transactionData) {
  
  try {
  return await prisma.transaction.create({
    data: {
      amount: Number(transactionData.amount),        
      invoice_no: Number(transactionData.invoice_no),
      supplier_id: Number(transactionData.supplier_id),
      invoice_date: new Date(transactionData.invoice_date),
      payment_type: transactionData.payment_type   
    }
  });
} catch (error) {
    throw new Error("This is a Duplicate Transaction " + error.message);

}
}

// Builds a Prisma where clause from per-column filters; blank/invalid values are ignored.
function buildTransactionFilter(filters = {}) {
  const where = {};
  const toInt = (v) => {
    const n = Number(v);
    return v !== undefined && v !== '' && Number.isInteger(n) ? n : null;
  };

  const transactionId = toInt(filters.transaction_id);
  if (transactionId !== null) where.transaction_id = transactionId;

  const invoiceNo = toInt(filters.invoice_no);
  if (invoiceNo !== null) where.invoice_no = invoiceNo;

  const amount = toInt(filters.amount);
  if (amount !== null) where.amount = amount;

  if (filters.payment_type === 'CR' || filters.payment_type === 'DR') {
    where.payment_type = filters.payment_type;
  }

  if (filters.supplier && filters.supplier.trim()) {
    where.supplier = { supplier_name: { contains: filters.supplier.trim() } };
  }

  // Invoice dates are saved as UTC midnight, so match the whole UTC day.
  if (/^\d{4}-\d{2}-\d{2}$/.test(filters.invoice_date || '')) {
    const start = new Date(`${filters.invoice_date}T00:00:00.000Z`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    where.invoice_date = { gte: start, lt: end };
  }

  return where;
}

async function getTransactions(page = 1, limit = 10, filters = {}) {
  const skip = (page - 1) * limit;
  const where = buildTransactionFilter(filters);

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: { supplier: true }
    }),
    prisma.transaction.count({ where })
  ]);

  return {
    transactions,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

async function getTransactionById(id) {

  const txId = Number(id);
  return await prisma.transaction.findUnique({
    where: { transaction_id: txId },
    include: { supplier: {
      select: { supplier_id: true, supplier_name: true, address: true }
    } }   
  });
}

async function updateTransaction(id, payload) {

  const txId = Number(id);
  const existing = await prisma.transaction.findUnique({
    where: { transaction_id: txId }
  });

  if (!existing) {
    throw new Error("Transaction not found");
  }

  const updated = await prisma.transaction.update({
    where: { transaction_id: txId },
    data: payload
  });

  return updated;
}


// CR = purchase from supplier, DR = payment made to supplier.
// from / to are optional "YYYY-MM-DD" strings (inclusive). Without them the range is
// the current calendar month plus the previous two. Invoice dates are stored as UTC
// midnight, so the range and the month buckets are worked out on UTC days.
async function getDashboardSummary(from, to) {
  const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || '');
  const pad = (n) => String(n).padStart(2, '0');
  const now = new Date();

  if (!isDate(to)) {
    to = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }
  if (!isDate(from)) {
    const d = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    from = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
  }
  if (from > to) [from, to] = [to, from];

  const start = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(new Date(`${to}T00:00:00.000Z`).getTime() + 24 * 60 * 60 * 1000);

  // One bucket per calendar month touched by the range
  const monthly = [];
  for (
    let d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    d < end;
    d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
  ) {
    monthly.push({
      key: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`,
      label: d.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
      cr: 0,
      dr: 0,
      crCount: 0,
      drCount: 0
    });
  }
  const monthIndex = Object.fromEntries(monthly.map((m, i) => [m.key, i]));

  const transactions = await prisma.transaction.findMany({
    where: { invoice_date: { gte: start, lt: end } },
    select: {
      amount: true,
      payment_type: true,
      invoice_date: true,
      supplier: { select: { supplier_id: true, supplier_name: true } }
    }
  });

  const suppliers = {};
  for (const t of transactions) {
    const d = new Date(t.invoice_date);
    const key = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
    const m = monthly[monthIndex[key]];
    if (!m) continue;

    const s = suppliers[t.supplier.supplier_id] ||= {
      supplier_id: t.supplier.supplier_id,
      supplier_name: t.supplier.supplier_name,
      cr: 0,
      dr: 0
    };

    if (t.payment_type === 'CR') {
      m.cr += t.amount;
      m.crCount++;
      s.cr += t.amount;
    } else {
      m.dr += t.amount;
      m.drCount++;
      s.dr += t.amount;
    }
  }

  const totals = monthly.reduce(
    (acc, m) => ({ cr: acc.cr + m.cr, dr: acc.dr + m.dr }),
    { cr: 0, dr: 0 }
  );

  const topSuppliers = Object.values(suppliers)
    .sort((a, b) => (b.cr + b.dr) - (a.cr + a.dr))
    .slice(0, 10);

  return {
    from,
    to,
    monthly,
    totals: { ...totals, net: totals.cr - totals.dr },
    transactionCount: transactions.length,
    topSuppliers
  };
}


module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    getDashboardSummary
};