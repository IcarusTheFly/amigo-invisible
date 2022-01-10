require('dotenv').config();
const { config } = require('dotenv');
const nodemailer = require('nodemailer');
const configuration = require('./config.json');
const amigoList = configuration.amigoList;

const transporter = nodemailer.createTransport({
    host: configuration.smtpHostname, // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: configuration.port, // port for secure SMTP
    tls: {
       ciphers:'SSLv3',
       rejectUnauthorized: false
    },
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

let mailOptions = {
    from: '"Amigo Invisible" <' + process.env.EMAIL_USER + '>', // Sender address
    subject: 'Aquí está tu amigo invisible' // Subject line
};

const sendSingleEmail = (amigo) => {
    return new Promise((resolve, reject) => {
        const HTMLTemplate = `
        <!DOCTYPE html>
        <html>
            <body>
                <div style="background:#63b967;background-color:#63b967;margin:0px auto;max-width:600px;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#63b967;background-color:#63b967;width:100%;">
                        <tbody>
                            <tr>
                                <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;vertical-align:top;"><!--[if mso | IE]>
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:600px;">
                                    <![endif]-->
                                    <div class="dys-column-per-100 outlook-group-fix" style="direction:ltr;display:inline-block;font-size:13px;text-align:left;vertical-align:top;width:100%;">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                            <tbody>
                                                <tr>
                                                    <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="width:216px;">
                                                                        <img alt="Amigo Invisible" height="250" src=" ` + configuration.logo + ` " style="border:none;display:block;font-size:13px;height:250px;outline:none;text-decoration:none;width:100%;" width="216">
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                        <div style="color:#FFFFFF;font-family:'Droid Sans', 'Helvetica Neue', Arial, sans-serif;font-size:36px;line-height:1;text-align:center;">
                                                            Hola ` + amigo.name + `!
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                        <div style="color:#096410;font-family:'Droid Sans', 'Helvetica Neue', Arial, sans-serif;font-size:16px;line-height:20px;text-align:center;">
                                                            Te ha tocado hacerle un regalo a:
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                        <div style="color:#096410;font-family:'Droid Sans', 'Helvetica Neue', Arial, sans-serif;font-size:24px;line-height:20px;text-align:center;">
                                                            <strong>` + amigo.giftTo + `</strong>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                <!--[if mso | IE]>
                                </td></tr></table>
                                <![endif]-->
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </body>
        </html>
        `;

        mailOptions.to = amigo.email;
        mailOptions.subject = amigo.name + '! Aquí está tu amigo invisible!';
        mailOptions.html = HTMLTemplate;

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                reject(error);
            } else {
                console.log('Message sent: ' + info.response);
                resolve();
            }
        });
    });
};

const sendAllEmails = async function(amigoList) {
    let anyErrors = false;
    for (let i = 0; i < amigoList.length; i++) {
        try {
            const amigo = amigoList[i];
            await sendSingleEmail(amigo);
        } catch (err) {
            anyErrors = true;
            console.log(err);
        }
    }
    if (anyErrors) {
        console.log('There were some errors when sending the emails. Please see the output above.');
    } else {
        console.log('All the emails have been sent.');
    }
};

// Randomize array
amigoList.sort(() => 0.5 - Math.random());
for (let i = 0; i < amigoList.length; i++) {
    // TO-DO: This is a circular distribution and must be changed.
    amigoList[i].giftTo = i < amigoList.length - 1 ? amigoList[i + 1].name : amigoList[0].name;
}

sendAllEmails(amigoList);