const express = require('express');
const { MongoClient } = require('mongodb');
const nodemailer = require("nodemailer");
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;

//middleware
app.use(cors());
app.use(express.json());

//SMTP configuration for nodemailer
const transporter = nodemailer.createTransport({// mail server info
    host: "server266.web-hosting.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'admin@codewavers.com', // generated ethereal user
        pass: 'N=c4+=9tW~_o', // generated ethereal password
    },
});

//DB access
const uri = `mongodb+srv://sisdbuser:n8ttANj0h2SrgEZA@cluster0.74f46.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//api function
async function run() {
    try {
        await client.connect();
        const database = client.db("propertyListing");
        const propertiesCollection = database.collection("properties");
        const appointmentsCollection = database.collection("appointments");
        //Find all properties
        app.get('/properties', async (req, res) => {
            const properties = await propertiesCollection.find({}).toArray();
            res.send(properties);
        });
        //find single property
        app.post('/property', async (req, res) => {
            const queryId = req.body;
            const query = {_id: ObjectId(queryId.id)};
                const property = await propertiesCollection.findOne(query);
                res.json(property);
        });
        //Inserting single property on properties collection
        app.post('/insertProperty', async (req, res) => {
            const property = req.body;
            const result = await propertiesCollection.insertOne(property);
            res.json(result);
        });
        //delete property
        app.delete('/properties/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await propertiesCollection.deleteOne(query);
            res.json(result);
        })
        //Find all appointments
        app.get('/appointments', async (req, res) => {
            const appointments = await appointmentsCollection.find({}).toArray();
            res.send(appointments);
        });
        //delete appointment
        app.delete('/appointments/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await appointmentsCollection.deleteOne(query);
            res.json(result);
        })
        //sending email
        const sendMail = async email => {
            await transporter.sendMail(email, (error, info) => {
                error ? console.log(error) : console.log(info);
            });
        }
        //Inserting appointment on appontments collection
        app.post('/insertAppointment', async (req, res) => {
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment);
            const email = {
                from: `New Appoointment from ${appointment.name} for ${appointment.propertyName} <admin@codewavers.com>`, // admin email address
                to: `abdulla.alkhatri2001@gmail.com`, // list of receivers
                subject: `New Appoointment from ${appointment.name} for ${appointment.propertyName}`, // Subject line
                html: `<p>Hlw good day, <br/> ${appointment.name} has just confirmed the appointment for ${appointment.propertyName}. Please contact him/her asap. </p> `, // html body
            }
            const email2 = {
                from: `New booking for ${appointment.propertyName} <admin@codewavers.com>`, // sender address
                to: appointment.email, // list of receivers
                subject: `Appoointment confirmed for ${appointment.propertyName}`, // Subject line
                html: `<p>Hlw ${appointment.name}, Your booking for ${appointment.propertyName} has been confirmed </p> `, // html body
            }
            sendMail(email2);
            sendMail(email);
            // res.json({ success: true, result });
            res.json({ success: true, result });
            console.log({ success: true, result });
        });


        // //Inserting single user ( student or teacher) on users collection
        // app.post('/insertUser', async (req, res) => {
        //     const user = req.body;
        //     const result = await usersCollection.insertOne(user);
        //     res.json(result);
        // });
        // //Inserting single course on properties collection ( similar to user insert)
        // app.post('/insertCourse', async (req, res) => {
        //     const course = req.body;
        //     const result = await propertiesCollection.insertOne(course);
        //     console.log('adding a new course', result);
        //     res.json(result);
        // });
        // //find users depending on specific user role
        // app.post('/roleBasedUsers', async (req, res) => {
        //     const role = req.body;
        //     const options = { sort: { _id: -1 } };//sort from latest to oldest
        //     const teachers = await usersCollection.find(role, options).toArray();
        //     res.json(teachers);
        // });




        // //get single service api
        // app.get('/services/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id)};
        //     const service = await servicesCollection.findOne(query);
        //     console.log('getting service', service);
        //     res.json(service);
        // })
        // //delete api
        // app.delete('/services/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id)};
        //     const result = await servicesCollection.deleteOne(query);
        //     console.log('deleting service', result);
        //     res.json(result);
        // })

    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);

//default route
app.get('/', (req, res) => {
    res.send('Running Property listing server');
});
app.listen(port, () => {
    console.log('Running Property listing server', port);
});