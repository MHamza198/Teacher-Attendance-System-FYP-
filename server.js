const path = require("path");
const express = require("express");
const bodyParser = require('body-parser');
const exphbs = require("express-handlebars");
const app = express();
const mongoose=require('mongoose');
require('dotenv').config()


// app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));



const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter);
app.use('/', adminRouter);

const teacherRouter = require('./routes/teacher');
app.use('/teacher', teacherRouter);

// Make the "assets" folder public.
app.use(express.static("assets"));
app.use(bodyParser.urlencoded({ extended: true }));

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main"
}));
app.set("view engine", ".hbs");

// Add your routes here

app.use(express.static(path.join(__dirname, "/css")));
app.use("/pic", express.static(path.join(__dirname, "/pic")));


// *** DO NOT MODIFY THE LINES BELOW ***

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
 

// Define a port to listen to requests on.  
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    app.listen(HTTP_PORT, onHttpStart);
})
.catch((error)=>{
    console.log(error);
})
// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
