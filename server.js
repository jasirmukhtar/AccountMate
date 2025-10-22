const express = require('express')
const app = express();
const path = require('path');
const supplierRoutes = require('./routes/supplierRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const transactionViewRoutes = require('./routes/transactionViewRoutes');
const supplierViewRoutes = require('./routes/supplierViewRoutes');
const { transaction } = require('./prisma/prismaClient');

app.set('view engine', 'ejs');
app.set("views", path.join(process.cwd(), "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Backend API
app.use("/api/supplier", supplierRoutes);
app.use("/api/transaction", transactionRoutes);

// Supplier Views
app.use("/", supplierViewRoutes);
// Create Transaction View
app.use("/", transactionViewRoutes);

app.listen(3000, ()=>{
    console.log("Server is listening on port 3000");
})  