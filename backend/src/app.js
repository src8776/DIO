const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
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

app.post('/api/shib-user', (req, res) => {
    const { uid, givenName, surname, email } = req.body;

    console.log('Received Shibboleth User:', { uid, givenName, surname, email });

    res.json({ message: 'User data received successfully', user: { uid, givenName, surname, email } });
});

const { upload, handleFileUpload } = require('./upload/handleFileUpload');
app.post('/api/upload', upload.single('csv_file'), handleFileUpload);

const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);  //points any api/user* calls from frontend to userRoutes file




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
        cookie: { secure: true },
        store: session.MemoryStore()
    }))

    siteRoot.use(passport.session())
    passport.use('saml', defaultSamlStrategy)

    /* user session */
    passport.serializeUser(function (user, done) {
        console.log(user);
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        console.log(user);
        done(null, user);
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
            failureRedirect: SITE_ROOT,
            failureFlash: true,
        }),
        function (req, res) {
            res.redirect(SITE_ROOT);
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

    siteRoot.get('/logout', (req, res) => {
        req.session.destroy()
        res.redirect(SITE_ROOT)
    })
}






// TODO: Add more REST endpoints here
module.exports = app;