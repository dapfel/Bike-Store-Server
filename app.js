import express from "express";
import cors from "cors";
import dotenv from "dotenv";
  dotenv.config();
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const port = process.env.PORT || 5000;
const app = initializeExpress();
let User;
let Bike;
let BikeSpec;
initializeDbConnection(passport);

app.post("/register", (req, res) => {
  registerUser(req, res);
});

app.post("/login", (req, res) => {
  loginUser(req, res);
});

app.get("/logout", (req, res) => {
  req.logout();
  res.status(200).send("logged out");
});

app.get('/bikes/featured', (req, res) => {
  sendFeaturedBikes(req, res);
});

app.get('/bikes/search', (req, res) => {
  searchBikes(req,res);
});

app.get("/bikes/filtered", (req, res) => {
  sendFilteredBikes(req, res);
});

app.get("/cartItems", (req, res) => {
  if (req.isAuthenticated()) {
    sendCartItems(req, res);
  } else {
    res.status(401).send("User not authenticated");
  }
});

app.post("/cartItems/:itemID", (req, res) => {
  if (req.isAuthenticated()) {
    addCartItemId(req, res);
  }
  else {
    res.status(401).send("User not authenticated");
  }
});

app.get("/purchase", (req, res) => {
  purchaseCartItems(req, res);
});

app.get("/bikeSpecList/:spec", (req, res) => {
  getBikeSpecList(req, res);
});

app.listen(port, () => console.log(`Listening on port ${port}`));

// ---------------- Helper Functions -------------------------------------------------------------------- //

function initializeExpress() {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors());
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
  
  return app;
}

function initializeDbConnection(passport) {
    mongoose.connect("mongodb://localhost:27017/bikeStoreDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    mongoose.set("useCreateIndex", true);
    
    const userSchema = new mongoose.Schema({
      username: String,
      password: String,
      firstName: String,
      lastName: String,
      cartItemIds: [String],
      creditCard: {num: String, exp: String, ccv: String}
    });
    
    userSchema.plugin(passportLocalMongoose);
    
    User = new mongoose.model("User", userSchema);
    
    passport.use(User.createStrategy());
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    const bikeSchema = new mongoose.Schema({
      name: String,
      brand: String,
      price: Number,
      description: String,
      featured: Boolean,
      electric: Boolean,
      wheelSize: String,
      color: String,
      material: String,
      dicipline: String,
      gender: String,
      image: String //base64 string
    });

    Bike = new mongoose.model("Bike", bikeSchema);

    const bikeSpecSchema = new mongoose.Schema({
      spec: String,
      nameList: [String]
    });
    
    BikeSpec = new mongoose.model("BikeSpec", bikeSpecSchema, "bikeSpecs");
}

function registerUser(req, res) {
  User.register({
    username: req.body.username, firstName: req.body.firstName, lastName: req.body.lastName,
  }, req.body.password, (err, newUser) => {
    if (err) {
      res.status(400).send("failed to register");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.status(200).send("registration completed");
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
      res.status(400).send("failed to login");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.status(200).send({userCart: req.user.cartItemIds, creditCard: req.user.creditCard});
      });
    }
  });
}

function sendFeaturedBikes(req, res) {
  Bike.find({featured: true}, (err, bikes) => {
    if (!err) {
    res.send({ bikeData: bikes});
    } else {
      res.send(err);
    }
  });
}


function searchBikes(req, res) {
  const searchTerm = req.query.searchTerm;
  var tokenizedSearchTerms = searchTerm.split(" "); 
  const conditions = [];
  tokenizedSearchTerms.forEach((term) => {
    conditions.push({name: {$regex: term, $options: 'i' }}, {description: {$regex: term, $options: 'i' }}, {brand: {$regex: term, $options: 'i'}});
  });
  let searchQuery;
  if (conditions.length > 1) { 
    searchQuery = {$or: conditions};
  } else {
    searchQuery = conditions[0];
  }
  Bike.find(searchQuery, (err, bikes) => {
    if (!err) {
    res.send({ bikeData: bikes});
    } else {
      res.send(err);
    }
  });
}

function sendFilteredBikes(req, res) {
  const searchOptions = req.query;
  let searchQuery = {};
  let priceMin;
  (Object.entries(searchOptions)).forEach(([key, val]) => {
    if (key === 'priceMin') {
      priceMin = val;
    }
    else if (key === 'priceMax') {
      searchQuery = {...searchQuery, price: { $lt: val, $gt: priceMin}};
    }
    else {
      searchQuery = {...searchQuery, [key]: val}
    }
  });
  Bike.find(searchQuery, (err, bikes) => {
    if (!err) {
    res.send({ bikeData: bikes});
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
}

function addCartItemId(req, res) {
  const newItemId = req.params.itemId;
  const query = {_id: req.user._id};
  const update = {$push: {cartItemIds: newItemId}}
  User.findOneAndUpdate(query, update, (err) => {
    if (!err) {
      res.status(200).send("item added to cart");

    } else {
      res.status(400).send("failed to add item to cart")
    }
  });
}

function purchaseCartItems(req, res) {
  TODO: "process payment and send reciept info if successfull. then empty cart"
}

function getBikeSpecList(req, res) {
  const query = {spec: req.params.spec};

  BikeSpec.findOne(query,(err, bikeSpec) => {
    if (!err) {
      res.status(200).send({specNameList: bikeSpec.nameList});
    } else {
      res.status(400).send("failed to get spec list");
    }
  });
}
