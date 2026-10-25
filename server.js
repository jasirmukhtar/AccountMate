const express = require('express')
const app = express();
const path = require('path');
const supplierRoutes = require('./routes/supplierRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const exportRoutes = require('./routes/exportRoutes');
const viewRoutes = require('./routes/viewRoutes');

app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Backend API
app.use("/api/supplier", supplierRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/export", exportRoutes);

// Pages
app.use("/", viewRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`);
});
