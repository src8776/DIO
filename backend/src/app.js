const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require("path");
const flash = require('connect-flash');

const app = express();
app.use(cors({
    //origin: 'http://dio.gccis.rit.edu',
    //credentials: true,
}));
app.use(bodyParser.json());
app.use(flash());
// Initialize session


if (process.env.NODE_ENV === "production") {
    //May need to be moved outside of function
    app.use(session({
        name: 'express-sess',
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
        store: session.MemoryStore()
    }));

    const passport = require('passport');
    const { defaultSamlStrategy, SP_CERT } = require('./saml.js');

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use('saml', defaultSamlStrategy);

    passport.serializeUser(function (user, done) {
        //console.log("Serializing:", user);
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        //console.log("Deserializing:", user);
        done(null, {
            email: user['urn:oid:0.9.2342.19200300.100.1.3'],
            firstName: user['urn:oid:2.5.4.42'],
            lastName: user['urn:oid:2.5.4.4'],
            username: user['urn:oid:0.9.2342.19200300.100.1.1'],
        });
    });

    const SITE_ROOT = '/saml2';

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '/views'));

    const siteRoot = express.Router();
    app.use(SITE_ROOT, siteRoot);
    app.set('trust proxy', true);

    /* login example */
    siteRoot.get('/login', passport.authenticate('saml'));
    /* end login example */

    /* acs example */
    siteRoot.post(
        "/acs",
        bodyParser.urlencoded({ extended: false }),
        passport.authenticate("saml", {
            failureRedirect: "/unauthorized",
            failureFlash: true,
        }),
        function (req, res) {
            res.redirect('/home');
        },
    );
    /* end acs example */

    /* metadata example */
    siteRoot.get(
        "/metadata",
        (req, res) => {
            res.set('Content-Type', 'text/xml');
            res.send(defaultSamlStrategy.generateServiceProviderMetadata(SP_CERT, SP_CERT));
        }
    );
    /* end metadata example */

    // Check if user is authenticated
    siteRoot.get('/api/me', (req, res) => {
        if (req.isAuthenticated()) {
            res.json(req.user);
        } else {
            res.status(401).json({ message: 'Not authenticated' });
        }
    });

    siteRoot.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Error destroying session' });
            }
            res.status(200).json({ message: 'Logged out successfully' });
        });
    });
    
}

/*
NOTE TO ALL!!! ALL BACKEND ROUTES SHOULD BEGIN WITH '/api/'!!!
THIS MAKE SURE WE KNOW WHAT IS BEING SENT TO BACKEND VERSUS FRONTEND
*/

// For health check
app.get('/api/health', (req, res) => {
    res.status(200).send('SERVER UP');
});

// Add admin route
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
app.use('/api/memberDetails', memberDetailsRoutes);

const { upload, handleFileUpload } = require('./upload/handleFileUpload');
app.post('/api/upload', upload.single('csv_file'), handleFileUpload);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/admin/report', reportRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

// TODO: Add more REST endpoints here
module.exports = app;