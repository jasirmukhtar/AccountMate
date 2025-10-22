const express = require('express')
const app = express();
const supplierRoutes = require('./routes/supplierRoutes');


// EJS
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(fileUpload());

app.use("/api/supplier", supplierRoutes);


app.listen(3000, ()=>{
    console.log("Server is listening on port 3000");
})  