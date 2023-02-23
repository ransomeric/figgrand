var express = require("express");
var bodyParser = require("body-parser");
var nodemailer = require("nodemailer");
var axios = require("axios");

const mongoose = require("mongoose");
const cors = require("cors");

const users = require("./routes/api/users");
const auth = require("./routes/api/auth");
const transactions = require("./routes/api/transactions");
const accounts = require("./routes/api/accounts");
const notifications = require("./routes/api/notifications")
const password_reset = require("./routes/api/password_reset");

var session = require("express-session");
var flash = require("connect-flash");
const sendMail = require("./sendEmail")
const redis = require('redis');
var redisClient;
const connectRedis = require('connect-redis');

const functions = require("./functions");
const options = require("./options");

var cron = require('node-cron');

var app = express();
app.use(cors());
app.use(express.json());

const dotenv = require("dotenv");
dotenv.config(/*{ path: "../.env" }*/);

const db = process.env.mongoURI;
console.log({db});

let referral_bonus = process.env["REFERRAL_BONUS"];
let current_btc_price = process.env["BTC_PRICE"]

var path = __dirname + "/views";
var port = process.env.PORT || 3000;

var isProd = process.env.NODE_ENV === "prod"
var website_url = user_board_url = server_base_url = isProd
    ? process.env["WEBSITE_PROD_URL"]
    : process.env["WEBSITE_URL"];

    mongoose
    .connect(db, {
        useNewUrlParser: true,
        //useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => console.log(err));


    app.set('trust proxy', 1);
    const RedisStore = connectRedis(session);

//https://stackoverflow.com/a/70989016
(async () => {
    redisClient = redis.createClient({
        /*url: "redis://localhost:6379",*/
        legacyMode: true,
        password: 'zIEusbGtKZdpKVBD8IkHOf5ltUhuvN0p',
        socket: {
            host: 'redis-14926.c100.us-east-1-4.ec2.cloud.redislabs.com',
            port: 14926
        }
    })
    redisClient.on('error', function (err) {
        console.log('Could not establish a connection with redis. ' + err);
    });
    await redisClient.connect();
    await redisClient.set("key", "value");
    console.log('Connected to redis successfully');
})();

const getBTCPrice = () => {
    axios.get(
        /*"https://www.blockchain.com/explorer/_next/data/ae6d6d85-prod/prices.json"*/
        "https://api.polygon.io/v2/aggs/ticker/X:BTCUSD/prev?adjusted=true&apiKey=oTrNdaXhAZXLaP4T2xQhvbO9XPbepgjC"
        ).then(res => {

        current_btc_price = res.data.results[0]['c']//.pageProps.marketData.btcPrice
        console.log("price", current_btc_price);
    }).catch(err => console.log(err))
}
getBTCPrice()
//setTimeout(getBTCPrice, 1000 * 60 * 60 * 5)

app.use(
    session({
        secret: "secret",
        cookie: {
            maxAge: 1000 * 60 * 15,
        },
        saveUninitialized: true,
        resave: true,
    })
);

//app.use(flash());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
console.log(website_url);

//Configure session middleware
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'secret$%^134',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // if true only transmit cookie over https
        httpOnly: false, // if true prevent client side JS from reading the cookie 
        maxAge: 1000 * 60 * 60 // session max age in miliseconds
    }
}))

setTimeout(async () => {
    var isProd = process.env.NODE_ENV === "prod"

    await functions.generateToken(
        /*isProd
            ? process.env["SERVER_BASE_PROD_URL"]
            : process.env["SERVER_BASE_URL"]*/
            server_base_url
            ,
        process.env["ADMIN_EMAIL"],
        process.env["ADMIN_PASSWORD"]
    )
    cron.schedule('*/5 * * * *', () => {
        console.log('running depositROIs every minute');
        functions.depositROIs()
    });


}, 20000)

app.use(express.static("public", {maxAge: 1000 * 60 * 60 * 24 * 31 } ));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    console.log({ user_board_url });
    res.render(path + "/index", {
        page_name: "index",
        user_dashboard_url: user_board_url,
        user_dashboard_login: user_board_url + "/login",
        user_register: user_board_url + "/register",
    });
});

app.get("/about", (req, res) => {
    res.render(path + "/about-us", {
        page_name: "about-us",
        user_dashboard_login: user_board_url + "/login",
        user_register: user_board_url + "/register",
    });
});

app.get("/contact", (req, res) => {
    res.render(path + "/contact", {
        page_name: "contact",
        user_dashboard_login: user_board_url + "/login",
        user_register: user_board_url + "/register",
    });
});

app.post("/contact-us", async (req, res) => {
    const { name, email, message } = req.body
    console.log({name, email, message});
   await sendMail({
        firstname: name,
        lastname: "",
        email,
        message,
        mail_type: "contact"
    })
    res.send({
        success: true
    })
})

app.get("/services", (req, res) => {
    res.render(path + "/our-services", {
        page_name: "services",
        user_dashboard_login: user_board_url + "/login",
        user_register: user_board_url + "/register",
    });
});

app.get("/privacy", (req, res) => {
    res.render(path + "/privacy", {
        page_name: "privacy",
        user_dashboard_login: user_board_url + "/login",
        user_register: user_board_url + "/register",
    });
});

app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/transactions", transactions);
app.use("/api/accounts", accounts);
app.use("/api/notifications", notifications)
app.use("/api/password_reset", password_reset)


//userdashboard
const fetchData = async (user) => {
    console.log("fetching data...");
    console.log("user", user);
    console.log("user._id", user._id,/* "JSON.parse(user)._id", JSON.parse(user)._id*/);
    const data = {};
    const transactions = await functions.getTransactions(user._id);
    const accounts = await functions.getAccounts(user._id);


    const investments = await functions.getTotalInvestment(transactions, accounts);

    const downlines = await functions.getDownlines(user.referral_code);
    const upline_details = await functions.getUplineDetails(user.upline);
    const ref_profits = functions.getRefProfits(transactions);
    const notifications = await functions.getNotifications(user._id);

    const is_admin = user && user.role.includes("admin")
    const user_has_account = accounts && accounts.length ? true : false;
    if (is_admin) {
        //sess.page = "admin"
        const approved_transactions = await functions.getAllTransactions("approved");
        const active_investments = await functions.getAllTransactions("active")
        const pending_transactions = await (await functions.getAllTransactions("pending")).filter(i => i.type !== "referral_bonus");
        const other_transactions = await (await functions.getAllTransactions("others")).filter(i => i.type !== "referral_bonus")
        const total_deposit = await functions.calcTotalTransByType(approved_transactions, "deposit");
        const total_withdrawn = await functions.calcTotalTransByType(approved_transactions, "withdrawal");
        const total_invested = await functions.calcTotalTransByType(active_investments, "investment");
        const all_accounts = await functions.getAccounts();
        const users = await functions.getUsers();
        //console.log(users);

        data["admin"] = {
            total_deposit,
            total_withdrawn,
            total_invested,
            pending_transactions,
            other_transactions,
            all_accounts,
            users
        }
    }

    data["available_balance"] = (accounts && accounts.length ? accounts[0].balance : 0)// + ( Object.keys(investments).length ? investments.investment_profit: 0);
    data["total_invested"] = investments.total;
    data["total_profits"] = investments.investment_profit + investments.referral_bonus;
    data["account_balance"] = (accounts && accounts.length ? accounts[0].balance : 0) //+ investments.total;
    data["this_month"] = {
        profits: investments.this_month.profit,
        referrals: investments.this_month.referral_bonus,
        total: investments.this_month.profit,
        investment_profit: investments.this_month.investment_profit
    }
    data["investments"] = {
        total: investments.total,
        count: investments.investments.length,
        items: investments.investments,

    }
    data["accounts"] = accounts[0];
    data["user"] = {
        has_account: user_has_account,
        ...user,
        upline: upline_details,
        notifications,
        downlines,
        ref_profits,
        password: user.password,
        ref_link: user_board_url + "/register?code=" + user.referral_code,
    }
    data["currency"] = accounts && accounts.length ? accounts[0].currency : "BTC"

    data["website"] = website_url;
    console.log("done fetching data.");
    console.log(data);
    return data
}

app.get("/authorize", (req, res) => {
    res.render(path + "/dashboard" + "/index", {
        page_name: "index",
        token: req.query.t
    });
});

app.get("/app", async (req, res) => {
    console.log("hit /app route");
    const sess = req.session;
    //const data = {};

    if (sess.email && sess.password /*&& sess.data*/) {
         const data = await fetchData(JSON.parse(sess.user))
        req.session["data"] = data;
        res.render(path + "/dashboard" + "/index", {
            page_name: "index",
            data: sess.data
        });
    } else {
        req.session["page"] = "overview"
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/auth",
            redirect_url: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/app"
        });
    }
});


app.get("/plans", async (req, res) => {
    const sess = req.session;
    if (sess.email && sess.password) {
         const data = await fetchData(JSON.parse(sess.user))
        req.session["data"] = data;
        //const data = sess.data;
        res.render(path + "/dashboard" + "/plans", {
            page_name: "plans",
            data
        });
    } else {
        req.session["page"] = "plans"
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/auth",
            redirect_url: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/app"
        });
    }
});

app.get("/plan-details", async (req, res) => {
    const sess = req.session;
    if (sess.email && sess.password) {
         const data = await fetchData(JSON.parse(sess.user))
        req.session["data"] = data;
        //const data = sess.data;
        let investment_id = req.query.id;
        let plan;

        if (investment_id) {
            plan = data.accounts.investments.find(i => i._id === investment_id);
            let details = options.inv_plans.find(p => p.id === plan.plan_id)
            //console.log({plan_rois: plan.profit.rois});
            //console.log("options.inv_plans.find(p => p.id === selected_plan)", 
            //options.inv_plans.find(p => p.id === plan.plan_id));
            plan["name"] = details.name;
            plan["roi"] = details.roi;
            plan["duration"] = details.duration;
        }
        res.render(path + "/dashboard" + "/plan-details", {
            page_name: "plan-details",
            data,
            plan
            /*user: JSON.parse(sess.user),
            website: process.env["WEBSITE_URL"],
            notifications*/
        });
    } else {
        req.session["page"] = "plan-details"
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/auth",
            redirect_url: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/app"
        });
    }
});

app.get("/invest", async (req, res) => {
    const sess = req.session;

    if (sess.email && sess.password) {
        const data = await fetchData(JSON.parse(sess.user))
        req.session["data"] = data;
        const notifications = sess.notifications//await functions.getNotifications(JSON.parse(sess.user).id);
        //const data = sess.data;
        res.render(path + "/dashboard" + "/invest", {
            page_name: "invest",
            /*user: JSON.parse(sess.user),
            website: process.env["WEBSITE_URL"],
            notifications,*/
            data,
            inv_plans: options.inv_plans
        });
    } else {
        req.session["page"] = "invest"
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/auth",
            redirect_url: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/app"
        });
    }

});

app.get("/login", (req, res) => {
    res.render(path + "/dashboard" + "/auth-signin", {
        page_name: "auth-signin",
        error: req.query.auth ? "Invalid login credentials" : null,
        login_endpoint: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/auth",
        redirect_url: user_board_url + "/app"
    });
})

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return console.log(err);
        }
        res.redirect("/login")
    });
})

app.get("/register", (req, res) => {
    res.render(path + "/dashboard" + "/auth-signup", {
        page_name: "auth-signup",
        error: null,
        redirect_url: user_board_url + "/app"

    });
});

app.post("/submit-registration", async (req, res) => {
    console.log("submit registration");
    // generate referral code
    const { username,
        email,
        password,
        firstname,
        lastname,
        referral_code,
        upline
    } = req.body;
    console.log(req.body);
    let response = {
        success: false,
        error: undefined
    };
    await axios.post(server_base_url + "/api/users", {
        username,
        email,
        password,
        firstname,
        lastname,
        referral_code,
        upline
    }).then(async resp => {
        response.success = true
        console.log("success");
        await sendMail({
            firstname, lastname, email, mail_type: "client_welcome"
        });

        await sendMail({
            firstname, lastname, email, mail_type: "new_user_notification"
        })
        console.log(resp)
    }).catch(err => {
        //console.log(err) 
        console.log("error", err);
        response.error = err.response && err.response.data ? err.response.data.msg : "Something went wrong. Please try again."
    })

    console.log({ response });
    if (response.success) {
        console.log('reg success');
        res.redirect("/login");
    } else {
        res.render(path + "/dashboard" + "/auth-signup", {
            page_name: "auth-signup",
            error: response.error
        });
    }
})


app.post("/auth", async (req, res) => {
    console.log("req.session.page", req.session.page);

    let response = {
        success: false,
        error: undefined
    };

    await axios.post(`${server_base_url}/api/auth`, {
        email: req.body["email"],
        password: req.body["password"],
    }, {
        headers: {
            "Content-type": "application/json",
        },
    }).then(async resp => {
        const sess = req.session;

        const { email, password } = req.body
        sess.email = email
        sess.password = password
        sess.token = resp.data.token;
        resp["data"]["user"].password = password
        sess.user = JSON.stringify(resp.data.user)

        response.success = true
        response.data = resp.data
        const is_admin = JSON.parse(sess.user) && JSON.parse(sess.user).role.includes("admin")

        if (is_admin) {
            sess.page = "admin"
        }else {
            sess.page="overview"
        }
        //console.log("data", JSON.stringify(data));
       // const data = await fetchData(JSON.parse(sess.user))
       // req.session["data"] = data;

    }).catch(err => {
        //console.log(err) 
        console.log("error", err);
        response.error = err.response && err.response.data ? err.response.data.msg : "We couln't authenticate you. Please try again."
    })
    console.log("response.success", response.success);
    if (response.success) {
        res.send({ token: response.data.token, redirect: `${user_board_url}${req.session.page && req.session.page !== "overview" ? "/" + req.session.page : "/app"}`, user: JSON.stringify(response.data.user) })
    } else {
        res.send({ ...response })
    }
})

app.get("/admin", async (req, res) => {
    const sess = req.session;
    //console.log("user role", sess.user.role, "parsed role", JSON.parse(sess.user).role);
    if (sess.email && sess.password && (sess.user && JSON.parse(sess.user).role.includes("admin"))) {
        const data = await fetchData(JSON.parse(sess.user))
        req.session["data"] = data;
        //const data = sess.data;
        const { total_deposit, total_withdrawn, total_invested, pending_transactions, other_transactions } = data.admin
        //console.log("show data.admin");
        //console.log(data.admin);
        res.render(path + "/dashboard" + "/admin", {
            data,
            page_name: "admin",
            user: JSON.parse(sess.user),
            total_deposit,
            total_withdrawn,
            total_invested,
            pending_transactions,
            other_transactions
            // notifications
        });
    } else {
        req.session["page"] = "admin"
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: sess.user && (!JSON.parse(sess.user).role.includes("admin"))
                ? "You need an admin account to access this page"
                : req.query.auth ? "Invalid login credentials"
                    : null,
            login_endpoint: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/auth",
            redirect_url: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/app"
        });
    }
});

app.post("/invest", async (req, res) => {
    const response = { success: false }
    const sess = req.session;
    if (sess.email && sess.password) {
    if (req.session.data && req.session.data.user) {
        const user = req.session.data.user
        const { firstname, lastname, email } = user
        let post_data = req.body
        post_data["created_by"].firstname = firstname;
        post_data["created_by"].lastname = lastname;
        post_data["created_by"].email = email;
        let headers = {
            "Content-type": "application/json",
            "x-auth-token": req.session.token
        }
        await axios.post(
            `${server_base_url}/api/transactions`,
            post_data,
            {
                headers
            }
        ).then(async resp => {
            response.success = true;
            response.data = resp.data;
            if (response.data.type === "investment") {
                // response.data["_id"] = uuidv4();//here
                response.data["start_date"] = new Date().toISOString();
                response.data["last_updated"] = null;
                response.data["profit"] = { total: 0, rois: [] } //here
            }
            response.data.type = response.data.date_created = response.data.date_modified = undefined;

            let prev_inv = req.session.data.accounts && req.session.data.accounts.investments.length ? req.session.data.accounts.investments : []
            await axios.put(server_base_url
                + "/api/accounts/" + req.session.data.accounts._id, {
                id: req.session.data.accounts._id,
                balance: req.session.data.accounts.balance - post_data.amount,
                investments: prev_inv.length ? [...prev_inv, response.data] : [response.data] //here
            }, { headers })
                .catch(err => console.log("Update acc balance err", err))
            await axios.post(
                `${server_base_url}/api/notifications`,
                {
                    user: user._id,
                    title: "New Investment plan created",
                    description: "Your investment plan has been created."
                },
                {
                    headers
                }
            )//.then(respnse => /*console.log(respnse*/))
                .catch(err => console.log("Notifications err", err))
        }).catch(err => console.log("Depost err", err))
    }
    res.send(response)}
    else {
        req.session["page"] = "invest"
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/auth",
            redirect_url: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/app"
        });
    }
})

app.get("/invest-form", async (req, res) => {
    const sess = req.session;

    if (sess.email && sess.password) {
        const data = await fetchData(JSON.parse(sess.user))
        req.session["data"] = data;
        //console.log("sess.accounts", sess.accounts);
        const notifications = sess.notifications//await functions.getNotifications(JSON.parse(sess.user).id);
        const selected_plan = req.query["plan-iv"];
        //const data = sess.data;
        //console.log({selected_plan});
        res.render(path + "/dashboard" + "/invest-form", {
            page_name: "invest-form",
            data,
            /*user: JSON.parse(sess.user),
            website: process.env["WEBSITE_URL"],
            notifications,*/
            selected_plan: options.inv_plans.find(p => p.id === selected_plan)
        });
    } else {

        req.session["page"] = "invest-form?plan-iv=" + req.query["plan-iv"]
        console.log(req.query, req.session);
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/app"
        });
    }

});

app.get("/deposit", async (req, res) => {
    const sess = req.session;

    if (sess.email && sess.password) {
         const data = await fetchData(JSON.parse(sess.user))
        req.session["data"] = data;
        const notifications = sess.notifications// await functions.getNotifications(JSON.parse(sess.user).id);
        //const data = sess.data;
        res.render(path + "/dashboard" + "/deposit", {
            page_name: "deposit",
            data
            /* user: JSON.parse(sess.user),
             website: process.env["WEBSITE_URL"],
             notifications*/
            // use
        });
    } else {
        req.session["page"] = "deposit"
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/app"
        });
    }

});

app.post("/deposit", async (req, res) => {
    console.log("hit post deposit route");
    const {
        deposit_amount,
        deposit_currency,
    } = req.body;

    console.log({
        deposit_amount,
        deposit_currency,
    });

    const response = { success: false }
    const sess = req.session;
    console.log("sess.email ,sess.password", sess.email, sess.password);
    if (sess.email && sess.password) {
        //console.log("req.session.data && req.session.data.user", req.session.data && req.session.data.user);
    if (req.session.data && req.session.data.user) {
        const user = req.session.data.user
        const { firstname, lastname, email, upline } = user;

        let post_data = {
            type: "deposit",
            created_by: { id: user._id, firstname, lastname, email, upline },
            upline,
            amount: deposit_amount,
            currency: deposit_currency
        };

        //console.log({post_data});

        let headers = {
            "Content-type": "application/json",
            "x-auth-token": req.session.token
        };

        // notify admin of deposit transaction by mail
        axios.post(
            `${server_base_url}/api/transactions`,
            post_data,
            {
                headers
            }
        ).then(async resp => {
            //console.log(resp);
            response.success = true;
            response.data = resp.data
            // update notifications in menu by socket
            await sendMail({
                firstname,
                lastname,
                email: "payfoxtrade@gmail.com",
                mail_type: "new_deposit",
                amount: deposit_amount
            })
            await axios.post(
                `${server_base_url}/api/notifications`,
                {
                    user: user._id,
                    title: "Your Deposit Order is placed",
                    description: "Your deposit has been sent for approval. You will be notified when this has been done."
                },
                {
                    headers
                }
            ).then(respnse => console.log("successfully sent notification"/*respnse*/))
                .catch(err => console.log("Notifications err", err))
        }).catch(err => console.log("Depost err", err))
        res.send(response)
    }}else {
        req.session["page"] = "deposit"
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/app"
        });
    }
})

app.put("/update-transaction", async (req, res) => {
    console.log("req.body", req.body);
    const response = { success: false }
    if (req.session.user) {
        const sess = req.session
        let headers = {
            "Content-type": "application/json",
            "x-auth-token": req.session.token
        }

        let data = {
            id: req.body.id,
            status: req.body.status,
            modifier: {
                id: JSON.parse(req.session.user)._id,
                firstname: JSON.parse(req.session.user).firstname,
                lastname: JSON.parse(req.session.user).lastname,
                email: JSON.parse(req.session.user).email
            },
            date_modified: new Date().toISOString()
        }

        await axios.put(server_base_url
            + "/api/transactions/" + req.body.id,
            data, { headers }).then(async resp => {
                response.success = true;
                response.data = resp.data;
                response.data._id = response.data.type = response.data.date_created = response.data.date_modified = undefined;
                const user_details = sess.data.admin.users.find(u => u._id === resp.data.created_by.id);
                const { firstname, lastname, email, upline } = user_details 
                console.log("upline", upline);
                //console.log("resp.data.created_by.id", resp.data.created_by.id);
                if (req.body.status === "approved") {
                         
                    const user_account = sess.data.admin.all_accounts.find(a => a.created_by._id === resp.data.created_by._id)
                    const account_id = user_account && user_account._id;

                    let update_acc_body = {
                        id: user_account && user_account._id || undefined,
                        balance: user_account && parseInt(user_account.balance) + parseInt(resp.data.amount || 0),
                        created_by: resp.data.created_by,
                        modifier: data.modifier,
                    };

                    let post_acc_body = {
                        created_by: resp.data.created_by,
                        currency: resp.data.currency,
                        balance: resp.data.amount,
                        modifier: data.modifier,
                    };

                    let xyz = resp.data.amount * referral_bonus;

                    axios({
                        method: account_id ? "PUT" : "POST",
                        url: account_id
                            ? `${server_base_url}/api/accounts/${account_id}`
                            : `${server_base_url}/api/accounts`,
                        data: account_id ? update_acc_body : post_acc_body,
                        headers
                    }).then(res => console.log(/*res*/ "successfully created account")).catch(err => console.log(err))

                    await sendMail({
                        firstname,
                        lastname,
                        amount: resp.data.amount,
                        email,
                        mail_type: "approved_deposit"
                    })

                    if (upline) {
                        const upline_details = await functions.getUplineDetails(user_details.upline);
                        const upline_account = upline_details["accounts"];
    
                        let update_upline_acc_body = {
                            id: upline_account[0] && upline_account[0]._id || undefined,
                            balance: upline_account[0] && parseInt(upline_account[0].balance) + (parseInt(resp.data.amount) * referral_bonus),
                            created_by: { id: upline_details._id, firstname: upline_details.firstname, lastname: upline_details.lastname, email: upline_details.email },
                            modifier: data.modifier,
                        };
    
                        let post_upline_acc_body = {
                            created_by: { id: upline_details._id, firstname: upline_details.firstname, lastname: upline_details.lastname, email: upline_details.email },
                            currency: resp.data.currency,
                            balance: resp.data.amount * referral_bonus,
                            modifier: data.modifier,
                        };
    
                        let post_upline_data = {
                            type: "referral_bonus",
                            created_by: {
                                id: upline_details._id,
                                firstname: upline_details.firstname,
                                lastname: upline_details.lastname,
                                email: upline_details.email
                            },
                            upline: upline_details.upline,
                            amount: xyz,
                            currency: resp.data.currency
                        };

                        axios({
                            method: upline_account.length ? "PUT" : "POST",
                            url: upline_account.length
                                ? `${server_base_url}/api/accounts/${upline_account[0]._id}`
                                : `${server_base_url}/api/accounts`,
                            data: upline_account.length ? update_upline_acc_body : post_upline_acc_body,
                            headers
                        })
                        axios.post(
                            `${server_base_url}/api/transactions`,
                            post_upline_data,
                            {
                                headers
                            }
                        ).then(async resp => {
                            response.success = true;
                            response.data = resp.data
                            await axios.post(
                                `${server_base_url}/api/notifications`,
                                {
                                    user: upline_details._id,
                                    title: `Referral bonus deposited.`,
                                    description: `Your downline: ${user_details.firstname} ${user_details.lastname} has deposited ${resp.data.amount} and you have received ${resp.data.amount * referral_bonus} referral bonus.`
                                },
                                {
                                    headers
                                }
                            )
                                .catch(err => console.log("Notifications err", err))
                        }).catch(err => console.log("Depost err", err)) 
                        await sendMail({
                            firstname: upline_details.firstname,
                            lastname: upline_details.lastname,
                            amount: resp.data.amount,
                            email: upline_details.email,
                            mail_type: "referral_deposit",
                            message: `Your downline ${firstname} ${lastname} has just deposited ${resp.data.amount} BTC. You have been credited with ${xyz} BTC.`
                        })
                    }
                }
            })
            .catch(err => console.log("Update transaction err", err))
    }
    res.send(response)
})

app.get("/withdraw", async (req, res) => {
    const sess = req.session;

    if (sess.email && sess.password) {
         const data = await fetchData(JSON.parse(sess.user))
        req.session["data"] = data;
       // const notifications = await functions.getNotifications(JSON.parse(sess.user).id);
        //const data = sess.data
        res.render(path + "/dashboard" + "/withdraw", {
            page_name: "withdraw",
            data
        });
    } else {
        req.session["page"] = "withdraw"
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/app"
        });
    }

});

app.post("/withdraw", async (req, res) => {
    const response = { success: false }
    const sess = req.session;

    if (sess.email && sess.password) {
    if (req.session.data.user) {
        const user = //JSON.parse(
            req.session.data.user//);
        const { firstname, lastname, email } = user
        let post_data = req.body
        post_data["created_by"].firstname = firstname;
        post_data["created_by"].lastname = lastname;
        post_data["created_by"].email = email;
        console.log({ post_data });
        let headers = {
            "Content-type": "application/json",
            "x-auth-token": req.session.token
        }
       /* await axios.put(server_base_url
            + "/api/accounts/" + req.session.data.accounts._id, {
            id: req.session.data.accounts._id,
            balance: req.session.data.accounts.balance - post_data.amount,
        }, { headers })
            .catch(err => console.log("Update acc balance err", err))*/
        await axios.post(
            `${server_base_url}/api/transactions`,
            post_data,
            {
                headers
            }
        ).then(async resp => {
            response.success = true;
            response.data = resp.data;
            response.data._id = response.data.type = response.data.date_created = response.data.date_modified = undefined;

            await axios.post(
                `${server_base_url}/api/notifications`,
                {
                    user: user._id,
                    title: "New withdrawal request",
                    description: "Your withdrawal request has been recorded."
                },
                {
                    headers
                }
            )
                .catch(err => console.log("Notifications err", err))
        }).catch(err => console.log("Depost err", err))
    }
    res.send(response)} else {
        req.session["page"] = "withdraw"
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/app"
        });
    }
})

app.get("/profile", async (req, res) => {
    const sess = req.session;

    if (sess.email && sess.password) {
         const data = await fetchData(JSON.parse(sess.user))
        req.session["data"] = data;
        //const notifications = sess.notifications//await functions.getNotifications(JSON.parse(sess.user).id);
        //const data = sess.data
        res.render(path + "/dashboard" + "/profile", {
            page_name: "profile",
            data
            /* user: JSON.parse(sess.user),
             website: process.env["WEBSITE_URL"],
             notifications*/
        });
    } else {
        req.session["page"] = "profile"
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/app"
        });
    }

});

app.get("/profile-setting", async (req, res) => {
    const sess = req.session;
    if (sess.email && sess.password) {
         const data = await fetchData(JSON.parse(sess.user))
        req.session["data"] = data;
        //const notifications = sess.notifications//await functions.getNotifications(JSON.parse(sess.user).id);
        //const data = sess.data
        res.render(path + "/dashboard" + "/profile-setting", {
            page_name: "profile-setting",
            data
            /*user: JSON.parse(sess.user),
            website: process.env["WEBSITE_URL"],
            notifications*/
        });
    } else {
        req.session["page"] = "profile-setting"
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/app"
        });
    }

});

//https://dev.to/cyberwolves/how-to-implement-password-reset-via-email-in-node-js-132m

app.get("/forgot-password", async (req, res) => {
    res.render(path + "/dashboard" + "/forgot-password", {
        page_name: "forgot-password",
    })
})

app.get("/password_reset", async (req, res) => {
    //console.log("req.query.user_id", req.query.user_id, "req.query.token", req.query.token );
    res.render(path + "/dashboard" + "/reset-password", {
        page_name: "reset-password",
        user_id: req.query.user_id,
        token: req.query.token
    })
})

app.post("/reset-password", async (req, res) => {
    let response = {
        success: false,
        msg: ""
    }
    const { user_id, token, password } = req.body
    // console.log({ user_id, token, password });
    await axios.post(`${server_base_url}/api/password_reset/${user_id}/${token}`, {
        password
    }, {
        headers: {
            "Content-type": "application/json",
        },
    }).then(resp => {
        response.success = true
        response.msg = resp.data.msg;
    }).catch(err => {
        console.log("error", err);
        response.msg = err.response && err.response.data
            ? err.response.data.msg : "An error occured. Please try again."
    })
    res.send(response)
})

app.post("/forgot-password", async (req, res) => {
    let response = {
        success: false,
        error: undefined
    };

    await axios.post(`${server_base_url}/api/password_reset`, {
        email: req.body["email"]
    }, {
        headers: {
            "Content-type": "application/json",
        },
    }).then(resp => {
        response = resp.data
    }).catch(err => {
        console.log("error", err);
        response.error = err.response && err.response.data ? err.response.data.msg : "We couln't authenticate you. Please try again."
    })
    res.send(response)
})

app.get("/notifications", async (req, res) => {

    const id = req.query.id;
    console.log("id", id);
    const sess = req.session;
    if (sess.email && sess.password) {
        let data, notifications;

        if (id){
            notifications = sess.data.user.notifications.data
            data = sess.data
        } else {
            data = await fetchData(JSON.parse(sess.user))
            notifications = data.user.notifications.data
            req.session["data"] = data; 
        }

        if (id) {

            const notification = notifications ? notifications.find(n => n._id === id) : {}

            if (notification /*&& notification.status == "pending"*/) {
                await axios.put(`${server_base_url}/api/notifications/${id}`, {
                    status: "read"
                }, {
                    headers: {
                        "Content-type": "application/json",
                    },
                }).then(resp => {
                    console.log("success", resp);
                }).catch(err => {
                    console.log("error", err);
                    response.msg = err.response && err.response.data
                        ? err.response.data.msg : "An error occured. Please try again."
                })
                res.render(path + "/dashboard" + '/notification-details', {
                    page_name: "notification-details",
                    notification,
                    data
                })
            }
            
        } else {
            res.render(path + "/dashboard" + "/notifications", {
                page_name: "notifications",
                data
            })
        }
    } else {
        req.session["page"] = "notifications"
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/app"
        });
    }
});

app.get("/notifications/:id", async (req, res) => {
    const sess = req.session;
    if (sess.email && sess.password) {
        const data = sess.data
        const notifications = sess.data.user.notifications.data
        //console.log({ notifications });
        let id = req.params.id;
        // console.log({id});
        const notification = notifications ? notifications.find(n => n._id === id) : {}
        res.render(path + "/dashboard" + '/notification-details', {
            page_name: "notification-details",
            notification,
            data
        })
    } else {
        req.session["page"] = "notification-details"
        res.render(path + "/dashboard" + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/app"
        });
    }
})

app.post("/cancel-investment", async (req, res) => {
    console.log("in cancel inv");
    const response = { success: false }
    if (req.session.data.user) {
        const { id } = req.body
        console.log({ id });
        let prev_inv = req.session.data.accounts && req.session.data.accounts.investments.length
            ? req.session.data.accounts.investments : [];
        let inv = prev_inv.find(i => i._id === id);
        console.log("prev_inv.length b4", prev_inv.length);
        inv["status"] = "cancelled";
        prev_inv = prev_inv.filter(i => i._id !== id)
        console.log("prev_inv.length after", prev_inv.length);

        const final = prev_inv.length ? [...prev_inv, inv] : [response.data] //here
        // console.log(JSON.stringify({final}));
        let headers = {
            "Content-type": "application/json",
            "x-auth-token": req.session.token
        }
        //console.log("prev_inv", prev_inv);
        await axios.put(server_base_url
            + "/api/accounts/" + req.session.data.accounts._id, {
            id: req.session.data.accounts._id,
            balance: req.session.data.accounts.balance + inv.amount + inv.profit.total,
            investments: final
        }, { headers }).then(resp => {
            response["success"] = true;
            response["data"] = resp.data
        })
            .catch(err => console.log("Update acc balance err", err))
    }
    res.send(response)
})

app.listen(port, function () {
    console.log("website server listening at ", port);
});
