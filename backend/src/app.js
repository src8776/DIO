const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors({
    //origin: 'http://dio.gccis.rit.edu',
    //credentials: true,
}));
app.use(bodyParser.json());

/*
NOTE TO ALL!!! ALL BACKEND ROUTES SHOULD BEGIN WITH '/api/'!!!
THIS MAKE SURE WE KNOW WHAT IS BEING SENT TO BACKEND VERSUS FRONTEND
*/

// For health check
app.get('/api/health', (req, res) => {
    res.status(200).send('SERVER UP');
});

//add admin route
const adminRoutes = require('./routes/admin.js');
app.use('/api/admin', adminRoutes); 

// Add OrganizationRules route
const organizationRulesRoutes = require('./routes/organizationRules.js');
app.use('/api/organizationRules', organizationRulesRoutes);

const organizationInfoRoutes = require('./routes/organizationInfo.js');
app.use('/api/organizationInfo', organizationInfoRoutes);

const eventRoutes = require('./routes/events');
app.use('/api/admin/events', eventRoutes);

const memberRoutes = require('./routes/members');
app.use('/api/admin/members', memberRoutes);

const volunteerRoutes = require('./routes/volunteers');
app.use('/api/admin/volunteers', volunteerRoutes);

const memberDetailsRoutes = require('./routes/memberDetails.js');
app.use('/api/memberDetails', memberDetailsRoutes)

const { upload, handleFileUpload } = require('./upload/handleFileUpload');
app.post('/api/upload', upload.single('csv_file'), handleFileUpload);

const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/admin/report', reportRoutes);

//consider moving the below to a different file -adam
//Server only code for SAML
if (process.env.NODE_ENV === "production") {
    const session = require('express-session')
    const path = require("path");
    const { defaultSamlStrategy, SP_CERT } = require('./saml.js')
    const passport = require('passport')

    const SITE_ROOT = '/saml2'

    app.set('view engine', 'ejs')
    app.set('views', path.join(__dirname, '/views'));

    const siteRoot = express.Router()
    app.use(SITE_ROOT, siteRoot)
    app.set('trust proxy', true);

    siteRoot.use(session({
        name: 'express-sess',
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
        store: session.MemoryStore()
    }))

    siteRoot.use(passport.session())
    passport.use('saml', defaultSamlStrategy)

    /* user session */
    passport.serializeUser(function (user, done) {
        console.log("Serializing:",user);
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        console.log("Deserializing:",user);
        done(null, {
            email: user['urn:oid:0.9.2342.19200300.100.1.3'],
            firstName: user['urn:oid:2.5.4.42'],
            lastName: user['urn:oid:2.5.4.4'],
            username: user['urn:oid:0.9.2342.19200300.100.1.1'],
        });
    });
    /* end user session */

    siteRoot.get('/', (req, res) => {
        res.render("app", {
            user: req.user
        })
    })

    /* login example */
    siteRoot.get('/login', passport.authenticate('saml'))
    /* end login example */

    /* acs example */
    siteRoot.post(
        "/acs",
        bodyParser.urlencoded({ extended: false }),
        passport.authenticate("saml", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        function (req, res) {
            res.redirect('/');
        },
    )
    /* end acs example */

    /* metadata example */
    siteRoot.get(
        "/metadata",
        (req, res) => {
            res.set('Content-Type', 'text/xml');
            res.send(defaultSamlStrategy.generateServiceProviderMetadata(SP_CERT, SP_CERT))
        }
    )
    /* end metadata example */

    //Check if user is authenticated
    siteRoot.get('/api/me', (req, res) => {
        if (req.isAuthenticated()) {
          res.json(req.user);
        } else {
          res.status(401).json({ message: 'Not authenticated' });
        }
    });

    siteRoot.get('/logout', (req, res) => {
        req.session.destroy()
        res.redirect(SITE_ROOT)
    })
}






// TODO: Add more REST endpoints here
module.exports = app;