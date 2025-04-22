const SamlStrategy = require('@node-saml/passport-saml').Strategy;
const fs = require('fs');
const Member = require('./models/Member');

const BASE_URL = 'https://dio.gccis.rit.edu';
const SP_ENTITY_ID = 'https://dio.gccis.rit.edu/saml2';
const SP_PVK = fs.readFileSync('/opt/shared/sp.key', { encoding: 'utf8' });
const SP_CERT = fs.readFileSync('/opt/shared/sp.crt', { encoding: 'utf8' });

const IDP_SSO_URL = 'https://shibboleth.main.ad.rit.edu/idp/profile/SAML2/Redirect/SSO';
const IDP_CERT = fs.readFileSync('/opt/shared/idp.crt', { encoding: 'utf8' });


const defaultSamlStrategy = new SamlStrategy(
    {
        name: 'saml',
        callbackUrl: BASE_URL + '/saml2/acs',
        identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
        entryPoint: IDP_SSO_URL,
        issuer: SP_ENTITY_ID,
        idpCert: IDP_CERT,
        decryptionPvk: SP_PVK,
        decryptionCert: SP_CERT,

        signMetadata: true,
        wantAssertionsSigned: true,
        wantAuthnResponseSigned: true,
        disableRequestedAuthnContext: true
    },

    async (profile, done) => {
        try {
            // Extract the email from profile attributes
            const userEmail = profile.attributes['urn:oid:0.9.2342.19200300.100.1.3'];

            // Check if the user exists in the database
            const user = await Member.getMemberByEmail(userEmail);

            const bypassEmails = [
                "edb2875@rit.edu",
                "ahw4546@rit.edu",
                "ic8613@rit.edu",
                "dmm4199@rit.edu",
                "lcs9244@rit.edu",
                "msn2136@rit.edu",
                "src8776@rit.edu",
                "ltvvse@rit.edu",
                "vahcoms@rit.edu",
                "eac2138@rit.edu"
            ];

            if (bypassEmails.includes(userEmail)) {
                console.log(`User ${userEmail} bypassed authorization`);
                return done(null, profile.attributes);
            } else if (user) {
                console.log(`User ${userEmail} is logging in`);
                return done(null, profile.attributes);
            }

            if (!user) {
                console.log(`Unauthorized login attempt by ${userEmail}`);
                return done(null, false, { message: 'User not authorized'});
            }

            //console.log(`User ${userEmail} authenticated successfully.`);
            return done(null, user);
        } catch (error) {
            //console.error("Error during SAML authentication:", error);
            return done(error);
        }
    }
    /* end acs callback */
)

module.exports = {
    defaultSamlStrategy,
    IDP_CERT,
    SP_PVK,
    SP_CERT
};
