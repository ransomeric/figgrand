const nodemailer = require("nodemailer");

const mail_types = [
    {
        key: "client_welcome",
        subject: "New signup",
        text: "Welcome to PayfoxTrade",
    },
    {
        key: "new_user_notification",
        subject: "A new user just signed up on PayfoxTrade",
        text: "From all of us at Payfox."
    },
    {
        key: "password_reset",
        subject: "Reset your PayfoxTrade password",
        text: "Someone (hopefully you) has requested a password reset for your PayfoxTrade account. Follow the link below to set a new password:"
    },
    {
        key: "new_deposit",
        subject: "Confirm Deposit",
        text: "A user has deposited money into their account."
    },
    {
        key: "contact",
        subject: "New contact",
        text: "A user submitted the contact form."
    },
    {
        key: "approved_deposit",
        subject: "Aprroved Deposit",
        text: "Your deposit has been approved."
    },
    {
        key: "referral_deposit",
        subject: "You have a Referral bonus",
        text: "Your downline has deposited funds into their account and you have received a bonus."
    }
]

const mailer = (data) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com" /*"dsedelivery.com"*/,
        /* port: 587 //465,
         secureConnection: false //true,
         requiresAuth: true,
         domains: ["gmail.com", "googlemail.com"],*//*"dsedelivery.com"*/
        port: 465,
        secure: true,
        auth: {
            user: "payfoxtrade@gmail.com",//"support@dsedelivery.com",
            pass: "phreshtzbgmvjisi"//"fL({Rrbfm49J",
        },
        /*tls:{
            rejectUnauthorized:false
        }*/
    });

    // send mail with defined transport object
    let mailOptions = {
        from: "payfoxtrade@gmail.com" /*`support@dsedelivery.com`*/, // sender address
        to: [
            "new_user_notification",
            "new_deposit",
            "contact"
        ].includes(data.mail_type) ? "payfoxtrade@gmail.com" : data.email,
        subject: mail_types.find(m => m.key === data.mail_type).subject, //body.mail_type === "new_user_notification" ?  "New signup": "Welcome to PayfoxTrade", // Subject line
        text: mail_types.find(m => m.key === data.mail_type).text, //body.mail_type === mail_types[1] ?  "A new user just signed up on PayfoxTrade": "From all of us at Payfox.", // plain text body
        html: data.body, // html body
        attachments: [
            {
                filename: "payfoxtrade.jpg",
                path: __dirname + "/payfoxtrade.jpg",
                cid: "uniq-payfoxtrade.jpg"
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        req.flash("message", "Your request has been submitted successfully");
        res.redirect("/");
    });
}

const generateMailHTML = (data) => {
    const { firstname, lastname, mail_type, email, link, amount, message } = data;
    // const mail_type_obj = mail_types.find(m => m.key === mail_type )
    let html
    switch (mail_type) {
        case "client_welcome":
            html = `<!DOCTYPE html>
            <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="x-apple-disable-message-reformatting">
                <title></title>
                
                <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
                <!-- Web Font / @font-face : BEGIN -->
                <!--[if mso]>
                    <style>
                        * {
                            font-family: 'Roboto', sans-serif !important;
                        }
                    </style>
                <![endif]-->
            
                <!--[if !mso]>
                    <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
                <![endif]-->
            
                <!-- Web Font / @font-face : END -->
            
                <!-- CSS Reset : BEGIN -->
                
                
                <style>
                    /* What it does: Remove spaces around the email design added by some email clients. */
                    /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
                    html,
                    body {
                        margin: 0 auto !important;
                        padding: 0 !important;
                        height: 100% !important;
                        width: 100% !important;
                        font-family: 'Roboto', sans-serif !important;
                        font-size: 14px;
                        margin-bottom: 10px;
                        line-height: 24px;
                        color:#8094ae;
                        font-weight: 400;
                    }
                    * {
                        -ms-text-size-adjust: 100%;
                        -webkit-text-size-adjust: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    table,
                    td {
                        mso-table-lspace: 0pt !important;
                        mso-table-rspace: 0pt !important;
                    }
                    table {
                        border-spacing: 0 !important;
                        border-collapse: collapse !important;
                        table-layout: fixed !important;
                        margin: 0 auto !important;
                    }
                    table table table {
                        table-layout: auto;
                    }
                    a {
                        text-decoration: none;
                    }
                    img {
                        -ms-interpolation-mode:bicubic;
                    }
                </style>
            
            </head>
            
            <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f5f6fa;">
                <center style="width: 100%; background-color: #f5f6fa;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f5f6fa">
                        <tr>
                           <td style="padding: 40px 0;">
                                <table style="width:100%;max-width:620px;margin:0 auto;">
                                    <tbody>
                                        <tr>
                                            <td style="text-align: center; padding-bottom:25px">
                                                <a href="#"><img style="height: 40px" src="cid:uniq-payfoxtrade.jpg" alt="logo"></a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table style="width:100%;max-width:620px;margin:0 auto;background-color:#ffffff;">
                                    <tbody>
                                        <tr>
                                            <td style="padding: 30px 30px 20px">
                                                <p style="margin-bottom: 10px;">Hi ${firstname},</p>
                                                <p style="margin-bottom: 10px;">We are pleased to have you as a member of PayfoxTrade Family.</p>
                                                <p style="margin-bottom: 10px;">Your account is now verified and you can purchase BTC for investment.</p>
                                                <p style="margin-bottom: 15px;">Hope you'll enjoy the experience, we're here if you have any questions, drop us a line at <a style="color: #6576ff; text-decoration:none;" href="mailto:payfoxtrade@gmail.com">payfoxtrade@gmail.com</a> anytime. </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table style="width:100%;max-width:620px;margin:0 auto;">
                                <tbody>
                                    <tr>
                                        <td style="text-align: center; padding:25px 20px 0;">
                                            <p style="font-size: 13px;">Copyright © 2023 PayfoxTrade. All rights reserved..</p>
                                            <p style="padding-top: 15px; font-size: 12px;">This email was sent to you as a registered user of <a style="color: #6576ff; text-decoration:none;" href="https://payfoxtrade.com">payfoxtrade.com</a></p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                           </td>
                        </tr>
                    </table>
                </center>
            </body>
            </html>`
            break;
        case "new_user_notification":
            html = `<!DOCTYPE html>
            <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="x-apple-disable-message-reformatting">
                <title></title>
                
                <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
                <!-- Web Font / @font-face : BEGIN -->
                <!--[if mso]>
                    <style>
                        * {
                            font-family: 'Roboto', sans-serif !important;
                        }
                    </style>
                <![endif]-->
            
                <!--[if !mso]>
                    <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
                <![endif]-->
            
                <!-- Web Font / @font-face : END -->
            
                <!-- CSS Reset : BEGIN -->
                
                
                <style>
                    /* What it does: Remove spaces around the email design added by some email clients. */
                    /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
                    html,
                    body {
                        margin: 0 auto !important;
                        padding: 0 !important;
                        height: 100% !important;
                        width: 100% !important;
                        font-family: 'Roboto', sans-serif !important;
                        font-size: 14px;
                        margin-bottom: 10px;
                        line-height: 24px;
                        color:#8094ae;
                        font-weight: 400;
                    }
                    * {
                        -ms-text-size-adjust: 100%;
                        -webkit-text-size-adjust: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    table,
                    td {
                        mso-table-lspace: 0pt !important;
                        mso-table-rspace: 0pt !important;
                    }
                    table {
                        border-spacing: 0 !important;
                        border-collapse: collapse !important;
                        table-layout: fixed !important;
                        margin: 0 auto !important;
                    }
                    table table table {
                        table-layout: auto;
                    }
                    a {
                        text-decoration: none;
                    }
                    img {
                        -ms-interpolation-mode:bicubic;
                    }
                </style>
            
            </head>
            
            <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f5f6fa;">
                <center style="width: 100%; background-color: #f5f6fa;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f5f6fa">
                        <tr>
                           <td style="padding: 40px 0;">
                                <table style="width:100%;max-width:620px;margin:0 auto;">
                                    <tbody>
                                        <tr>
                                            <td style="text-align: center; padding-bottom:25px">
                                                <a href="#"><img style="height: 40px" src="cid:uniq-payfoxtrade.jpg" alt="logo"></a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table style="width:100%;max-width:620px;margin:0 auto;background-color:#ffffff;">
                                    <tbody>
                                        <tr>
                                            <td style="padding: 30px 30px 20px">
                                                <p style="margin-bottom: 10px;">Hi Payfox Support,</p>
                                                <p style="margin-bottom: 10px;">A new account has just been registered.</p>
                                                <p style="margin-bottom: 10px;">Name: ${firstname} ${lastname}.</p>
                                                <p style="margin-bottom: 15px;">Email: ${email} </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table style="width:100%;max-width:620px;margin:0 auto;">
                                <tbody>
                                    <tr>
                                        <td style="text-align: center; padding:25px 20px 0;">
                                            <p style="font-size: 13px;">Copyright © 2023 PayfoxTrade. All rights reserved..</p>
                                            <p style="padding-top: 15px; font-size: 12px;">This email was sent to you as a registered user of <a style="color: #6576ff; text-decoration:none;" href="https://payfoxtrade.com">payfoxtrade.com</a></p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                           </td>
                        </tr>
                    </table>
                </center>
            </body>
            </html>`
            break;
        case "password_reset":
            html = `<!DOCTYPE html>
            <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="x-apple-disable-message-reformatting">
                <title></title>
                
                <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
                <!-- Web Font / @font-face : BEGIN -->
                <!--[if mso]>
                    <style>
                        * {
                            font-family: 'Roboto', sans-serif !important;
                        }
                    </style>
                <![endif]-->
            
                <!--[if !mso]>
                    <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
                <![endif]-->
            
                <!-- Web Font / @font-face : END -->
            
                <!-- CSS Reset : BEGIN -->
                
                
                <style>
                    /* What it does: Remove spaces around the email design added by some email clients. */
                    /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
                    html,
                    body {
                        margin: 0 auto !important;
                        padding: 0 !important;
                        height: 100% !important;
                        width: 100% !important;
                        font-family: 'Roboto', sans-serif !important;
                        font-size: 14px;
                        margin-bottom: 10px;
                        line-height: 24px;
                        color:#8094ae;
                        font-weight: 400;
                    }
                    * {
                        -ms-text-size-adjust: 100%;
                        -webkit-text-size-adjust: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    table,
                    td {
                        mso-table-lspace: 0pt !important;
                        mso-table-rspace: 0pt !important;
                    }
                    table {
                        border-spacing: 0 !important;
                        border-collapse: collapse !important;
                        table-layout: fixed !important;
                        margin: 0 auto !important;
                    }
                    table table table {
                        table-layout: auto;
                    }
                    a {
                        text-decoration: none;
                    }
                    img {
                        -ms-interpolation-mode:bicubic;
                    }
                </style>
            
            </head>
            
            <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f5f6fa;">
                <center style="width: 100%; background-color: #f5f6fa;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f5f6fa">
                        <tr>
                           <td style="padding: 40px 0;">
                                <table style="width:100%;max-width:620px;margin:0 auto;">
                                    <tbody>
                                        <tr>
                                            <td style="text-align: center; padding-bottom:25px">
                                                <a href="#"><img style="height: 40px" src="cid:uniq-payfoxtrade.jpg" alt="logo"></a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table style="width:100%;max-width:620px;margin:0 auto;background-color:#ffffff;">
                                    <tbody>
                                        <tr>
                                            <td style="padding: 30px 30px 20px">
                                                <p style="margin-bottom: 10px;">Someone (hopefully you) has requested a password reset for your PayfoxTrade account. Follow the link below to set a new password:</p>
                                                
                                              <a href="${link}">  <p style="margin-bottom: 10px;">${link}</p></a>
                                                <p style="margin-bottom: 15px;">Email: If you don't wish to reset your password, disregard this email and no action will be taken. </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table style="width:100%;max-width:620px;margin:0 auto;">
                                    <tbody>
                                        <tr>
                                            <td style="text-align: center; padding:25px 20px 0;">
                                                <p style="font-size: 13px;">Copyright © 2023 PayfoxTrade. All rights reserved..</p>
                                                <p style="padding-top: 15px; font-size: 12px;">This email was sent to you as a registered user of <a style="color: #6576ff; text-decoration:none;" href="https://payfoxtrade.com">payfoxtrade.com</a></p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                           </td>
                        </tr>
                    </table>
                </center>
            </body>
            </html>`
            break
        case "new_deposit":
            html = `<!DOCTYPE html>
                <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="x-apple-disable-message-reformatting">
                    <title></title>
                    
                    <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
                    <!-- Web Font / @font-face : BEGIN -->
                    <!--[if mso]>
                        <style>
                            * {
                                font-family: 'Roboto', sans-serif !important;
                            }
                        </style>
                    <![endif]-->
                
                    <!--[if !mso]>
                        <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
                    <![endif]-->
                
                    <!-- Web Font / @font-face : END -->
                
                    <!-- CSS Reset : BEGIN -->
                    
                    
                    <style>
                        /* What it does: Remove spaces around the email design added by some email clients. */
                        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
                        html,
                        body {
                            margin: 0 auto !important;
                            padding: 0 !important;
                            height: 100% !important;
                            width: 100% !important;
                            font-family: 'Roboto', sans-serif !important;
                            font-size: 14px;
                            margin-bottom: 10px;
                            line-height: 24px;
                            color:#8094ae;
                            font-weight: 400;
                        }
                        * {
                            -ms-text-size-adjust: 100%;
                            -webkit-text-size-adjust: 100%;
                            margin: 0;
                            padding: 0;
                        }
                        table,
                        td {
                            mso-table-lspace: 0pt !important;
                            mso-table-rspace: 0pt !important;
                        }
                        table {
                            border-spacing: 0 !important;
                            border-collapse: collapse !important;
                            table-layout: fixed !important;
                            margin: 0 auto !important;
                        }
                        table table table {
                            table-layout: auto;
                        }
                        a {
                            text-decoration: none;
                        }
                        img {
                            -ms-interpolation-mode:bicubic;
                        }
                    </style>
                
                </head>
                
                <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f5f6fa;">
                    <center style="width: 100%; background-color: #f5f6fa;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f5f6fa">
                            <tr>
                               <td style="padding: 40px 0;">
                                    <table style="width:100%;max-width:620px;margin:0 auto;">
                                        <tbody>
                                            <tr>
                                                <td style="text-align: center; padding-bottom:25px">
                                                    <a href="#"><img style="height: 40px" src="cid:uniq-payfoxtrade.jpg" alt="logo"></a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table style="width:100%;max-width:620px;margin:0 auto;background-color:#ffffff;">
                                        <tbody>
                                            <tr>
                                                <td style="padding: 30px 30px 20px">
                                                    <p style="margin-bottom: 10px;">Hi Payfox Admin,</p>
                                                    <p style="margin-bottom: 10px;">${firstname} ${lastname} has just deposited ${amount} BTC. Check your BTC wallet balance and confirm receipt of the BTC.</p>
                                                    <p style="margin-bottom: 10px;">If the funds have been confirmed, login to the admin dashboard and approve the deposit.</p>
                                                  
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table style="width:100%;max-width:620px;margin:0 auto;">
                                    <tbody>
                                        <tr>
                                            <td style="text-align: center; padding:25px 20px 0;">
                                                <p style="font-size: 13px;">Copyright © 2023 PayfoxTrade. All rights reserved..</p>
                                                <p style="padding-top: 15px; font-size: 12px;">This email was sent to you as a registered user of <a style="color: #6576ff; text-decoration:none;" href="https://payfoxtrade.com">payfoxtrade.com</a></p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                               </td>
                            </tr>
                        </table>
                    </center>
                </body>
                </html>`
            break;
        case "contact":
            html = `<!DOCTYPE html>
            <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="x-apple-disable-message-reformatting">
                <title></title>
                
                <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
                <!-- Web Font / @font-face : BEGIN -->
                <!--[if mso]>
                    <style>
                        * {
                            font-family: 'Roboto', sans-serif !important;
                        }
                    </style>
                <![endif]-->
            
                <!--[if !mso]>
                    <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
                <![endif]-->
            
                <!-- Web Font / @font-face : END -->
            
                <!-- CSS Reset : BEGIN -->
                
                
                <style>
                    /* What it does: Remove spaces around the email design added by some email clients. */
                    /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
                    html,
                    body {
                        margin: 0 auto !important;
                        padding: 0 !important;
                        height: 100% !important;
                        width: 100% !important;
                        font-family: 'Roboto', sans-serif !important;
                        font-size: 14px;
                        margin-bottom: 10px;
                        line-height: 24px;
                        color:#8094ae;
                        font-weight: 400;
                    }
                    * {
                        -ms-text-size-adjust: 100%;
                        -webkit-text-size-adjust: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    table,
                    td {
                        mso-table-lspace: 0pt !important;
                        mso-table-rspace: 0pt !important;
                    }
                    table {
                        border-spacing: 0 !important;
                        border-collapse: collapse !important;
                        table-layout: fixed !important;
                        margin: 0 auto !important;
                    }
                    table table table {
                        table-layout: auto;
                    }
                    a {
                        text-decoration: none;
                    }
                    img {
                        -ms-interpolation-mode:bicubic;
                    }
                </style>
            
            </head>
            
            <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f5f6fa;">
                <center style="width: 100%; background-color: #f5f6fa;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f5f6fa">
                        <tr>
                           <td style="padding: 40px 0;">
                                <table style="width:100%;max-width:620px;margin:0 auto;">
                                    <tbody>
                                        <tr>
                                            <td style="text-align: center; padding-bottom:25px">
                                                <a href="#"><img style="height: 40px" src="cid:uniq-payfoxtrade.jpg" alt="logo"></a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table style="width:100%;max-width:620px;margin:0 auto;background-color:#ffffff;">
                                    <tbody>
                                        <tr>
                                            <td style="padding: 30px 30px 20px">
                                                <h3 style="margin-bottom: 10px;">New contact form submission.</h3>
                                                
                                                <p style="margin-bottom: 10px;">Name: ${firstname}.</p>
                                                <p style="margin-bottom: 15px;">Email: ${email} </p>
                                                <p style="margin-bottom: 10px;">Message: ${message}</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table style="width:100%;max-width:620px;margin:0 auto;">
                                <tbody>
                                    <tr>
                                        <td style="text-align: center; padding:25px 20px 0;">
                                            <p style="font-size: 13px;">Copyright © 2023 PayfoxTrade. All rights reserved..</p>
                                            <p style="padding-top: 15px; font-size: 12px;">This email was sent to you as a registered user of <a style="color: #6576ff; text-decoration:none;" href="https://payfoxtrade.com">payfoxtrade.com</a></p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                           </td>
                        </tr>
                    </table>
                </center>
            </body>
            </html>`
            break;
        case "approved_deposit":
            html = `<!DOCTYPE html>
                <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="x-apple-disable-message-reformatting">
                    <title></title>
                    
                    <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
                    <!-- Web Font / @font-face : BEGIN -->
                    <!--[if mso]>
                        <style>
                            * {
                                font-family: 'Roboto', sans-serif !important;
                            }
                        </style>
                    <![endif]-->
                
                    <!--[if !mso]>
                        <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
                    <![endif]-->
                
                    <!-- Web Font / @font-face : END -->
                
                    <!-- CSS Reset : BEGIN -->
                    
                    
                    <style>
                        /* What it does: Remove spaces around the email design added by some email clients. */
                        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
                        html,
                        body {
                            margin: 0 auto !important;
                            padding: 0 !important;
                            height: 100% !important;
                            width: 100% !important;
                            font-family: 'Roboto', sans-serif !important;
                            font-size: 14px;
                            margin-bottom: 10px;
                            line-height: 24px;
                            color:#8094ae;
                            font-weight: 400;
                        }
                        * {
                            -ms-text-size-adjust: 100%;
                            -webkit-text-size-adjust: 100%;
                            margin: 0;
                            padding: 0;
                        }
                        table,
                        td {
                            mso-table-lspace: 0pt !important;
                            mso-table-rspace: 0pt !important;
                        }
                        table {
                            border-spacing: 0 !important;
                            border-collapse: collapse !important;
                            table-layout: fixed !important;
                            margin: 0 auto !important;
                        }
                        table table table {
                            table-layout: auto;
                        }
                        a {
                            text-decoration: none;
                        }
                        img {
                            -ms-interpolation-mode:bicubic;
                        }
                    </style>
                
                </head>
                
                <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f5f6fa;">
                    <center style="width: 100%; background-color: #f5f6fa;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f5f6fa">
                            <tr>
                               <td style="padding: 40px 0;">
                                    <table style="width:100%;max-width:620px;margin:0 auto;">
                                        <tbody>
                                            <tr>
                                                <td style="text-align: center; padding-bottom:25px">
                                                    <a href="#"><img style="height: 40px" src="cid:uniq-payfoxtrade.jpg" alt="logo"></a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table style="width:100%;max-width:620px;margin:0 auto;background-color:#ffffff;">
                                        <tbody>
                                            <tr>
                                                <td style="padding: 30px 30px 20px">
                                                    <p style="margin-bottom: 10px;">Hi ${firstname} ${lastname},</p>
                                                    <p style="margin-bottom: 10px;">Your deposit of ${amount} BTC has been confirmed.</p>
                                                    <p style="margin-bottom: 10px;">Login to your dashboard and invest to start earning.</p>
                                                  
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table style="width:100%;max-width:620px;margin:0 auto;">
                                    <tbody>
                                        <tr>
                                            <td style="text-align: center; padding:25px 20px 0;">
                                                <p style="font-size: 13px;">Copyright © 2023 PayfoxTrade. All rights reserved..</p>
                                                <p style="padding-top: 15px; font-size: 12px;">This email was sent to you as a registered user of <a style="color: #6576ff; text-decoration:none;" href="https://payfoxtrade.com">payfoxtrade.com</a></p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                               </td>
                            </tr>
                        </table>
                    </center>
                </body>
                </html>`
            break;
        case "referral_deposit":
                html = `<!DOCTYPE html>
                    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="x-apple-disable-message-reformatting">
                        <title></title>
                        
                        <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
                        <!-- Web Font / @font-face : BEGIN -->
                        <!--[if mso]>
                            <style>
                                * {
                                    font-family: 'Roboto', sans-serif !important;
                                }
                            </style>
                        <![endif]-->
                    
                        <!--[if !mso]>
                            <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
                        <![endif]-->
                    
                        <!-- Web Font / @font-face : END -->
                    
                        <!-- CSS Reset : BEGIN -->
                        
                        
                        <style>
                            /* What it does: Remove spaces around the email design added by some email clients. */
                            /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
                            html,
                            body {
                                margin: 0 auto !important;
                                padding: 0 !important;
                                height: 100% !important;
                                width: 100% !important;
                                font-family: 'Roboto', sans-serif !important;
                                font-size: 14px;
                                margin-bottom: 10px;
                                line-height: 24px;
                                color:#8094ae;
                                font-weight: 400;
                            }
                            * {
                                -ms-text-size-adjust: 100%;
                                -webkit-text-size-adjust: 100%;
                                margin: 0;
                                padding: 0;
                            }
                            table,
                            td {
                                mso-table-lspace: 0pt !important;
                                mso-table-rspace: 0pt !important;
                            }
                            table {
                                border-spacing: 0 !important;
                                border-collapse: collapse !important;
                                table-layout: fixed !important;
                                margin: 0 auto !important;
                            }
                            table table table {
                                table-layout: auto;
                            }
                            a {
                                text-decoration: none;
                            }
                            img {
                                -ms-interpolation-mode:bicubic;
                            }
                        </style>
                    
                    </head>
                    
                    <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f5f6fa;">
                        <center style="width: 100%; background-color: #f5f6fa;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f5f6fa">
                                <tr>
                                   <td style="padding: 40px 0;">
                                        <table style="width:100%;max-width:620px;margin:0 auto;">
                                            <tbody>
                                                <tr>
                                                    <td style="text-align: center; padding-bottom:25px">
                                                        <a href="#"><img style="height: 40px" src="cid:uniq-payfoxtrade.jpg" alt="logo"></a>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table style="width:100%;max-width:620px;margin:0 auto;background-color:#ffffff;">
                                            <tbody>
                                                <tr>
                                                    <td style="padding: 30px 30px 20px">
                                                        <p style="margin-bottom: 10px;">Hi ${firstname} ${lastname},</p>
                                                        <p style="margin-bottom: 10px;">${message}</p>
                                                    
                                                      
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table style="width:100%;max-width:620px;margin:0 auto;">
                                        <tbody>
                                            <tr>
                                                <td style="text-align: center; padding:25px 20px 0;">
                                                    <p style="font-size: 13px;">Copyright © 2023 PayfoxTrade. All rights reserved..</p>
                                                    <p style="padding-top: 15px; font-size: 12px;">This email was sent to you as a registered user of <a style="color: #6576ff; text-decoration:none;" href="https://payfoxtrade.com">payfoxtrade.com</a></p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                   </td>
                                </tr>
                            </table>
                        </center>
                    </body>
                    </html>`
                break;
    
            
        default:
            console.log("invalid mailtype", mail_type);
    }
    return html
}

//const data = { firstname: "Aminu", lastname: "Sadiq", email: "kelzvictoria@gmail.com", mail_type: mail_types[0], link }
const sendMail = async (data) => {
    let body = generateMailHTML(data)
    data.body = body;
    mailer(data)
}

module.exports = sendMail