import express from "express";
import dotenv from "dotenv";
  dotenv.config();
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import initializeDbConnection, {User, Bike} from "./init-DB-connection";

const port = process.env.PORT || 5000;
initializeExpress();
initializeDbConnection(passport);

app.post("/register", (req, res) => {
  registerUser(req, res);
});

app.post("/login", (req, res) => {
  loginUser(req, res);
});

app.get("/logout", (req, res) => {
  req.logout();
  res.send(200, "logged out");
});

app.get('/bikes', (req, res) => {
  sendAllBikes(req, res);
});

app.get("/cartItems", (req, res) => {
  if (req.isAuthenticated()) {
    sendCartItems(req, res);
  } else {
    res.send(401, "User not authenticated");
  }
});

app.post("/cartItems/:itemID", (req, res) => {
  if (req.isAuthenticated()) {
    addCartItemId(req, res);
  }
  else {
    res.send(401, "User not authenticated");
  }
});

app.get("/purchase", (req, res) => {
  purchaseCartItems(req, res);
})

app.listen(port, () => console.log(`Listening on port ${port}`));

// ---------------- Helper Functions -------------------------------------------------------------------- //

function initializeExpress() {
  const app = express();

  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(express.static("public"));
  app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());
}

function registerUser(req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, (err, newUser) => {
    if (err) {
      res.send(400, "failed to register");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.send(200, "registration completed");
      });
    }
  });
}

function loginUser (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, (err) => {
    if (err) {
      res.send(400, "failed to login");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.send(200, "login completed");
      });
    }
  });
}

function sendAllBikes(req, res) {
  Bike.find({}, (err, bikes) => {
    if (!err) {
    res.send({ data: bikes});
    } else {
      res.send(err);
    }
  });
}

function sendCartItems(req, res) {
  User.findOne({_id: req.user._id}, (err, user) => {
    if (!err) {
      const cartItems = Bike.find().where('_id').in(user.cartItemIds).exec((err, bikes) => {
        if (!err) {
          res.send({ data: cartItems});
        } else {
          res.send(err);
        }
      });
      } else {
        res.send(err);
      }
  });

  function addCartItemId(req, res) {
    const newItemId = req.body.newItemId;
    const query = {_id: req.user._id};
    const update = {$push: {cartItemIds: newItemId}}
    User.findOneAndUpdate(query, update, (err) => {
      if (!err) {
        res.send(200, "item added to cart");
      } else {
        res.send(400, "failed to add item to cart")
      }
    })
  }

  function purchaseCartItems(req, res) {
    TODO: "process payment and send reciept info if successfull. then empty cart"
  }
}