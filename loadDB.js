import express from "express";
import cors from "cors";
import dotenv from "dotenv";
  dotenv.config();
import bodyParser from "body-parser";
import fs from "fs";
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


const bikes = [
    {
        name: 'Cannondale Cujo 1 2020',
        brand: 'Cannondale',
        price: 1099.99,
        description: 'A mountain bike with more. More traction, more comfort, more capability to make every trail easier.',
        featured: true,
        electric: false,
        wheelSize: '27.5+"',
        color: 'Red',
        material: 'Aluminium',
        dicipline: 'MTB',
        gender: 'Womens',
        image: 'Cannondale-Cujo-1-2020'
      },
      {
        name: 'Cannondale Scalpel Carbon 3 2021',
        brand: 'Cannondale',
        price: 3499.99,
        description: 'This is the ultimate XC race bike. Ground-breaking suspension, aggressive geometry and feathery weight let you go full gas from the gun.',
        featured: true,
        electric: false,
        wheelSize: '29"',
        color: 'Black',
        material: 'Carbon',
        dicipline: 'MTB',
        gender: 'Mens',
        image: 'Cannondale-Scalpel-Carbon-3-2021'
      },
      {
        name: 'Cannondale Synapse Neo SE 650 2020',
        brand: 'Cannondale',
        price: 3299.99,
        description: 'A e-road bike, with the power, range and comfort to open the roads for everyone.',
        featured: true,
        electric: true,
        wheelSize: '700c',
        color: 'Green',
        material: 'Aluminium',
        dicipline: 'Road',
        gender: 'Mens',
        image: 'Cannondale-Synapse-Neo-SE-650-2020'
      },
      {
        name: 'Trek Madone SLR 6 Disc Project One',
        brand: 'Trek',
        price: 4500.00,
        description: 'This Project One Trek Madone SLR 6 Disc is a custom built race machine. Fast and aero and equipped with hydraulic disc brakes, it’s fully capable racing a crit but also versatile enough to take on the toughest training rides.',
        featured: true,
        electric: false,
        wheelSize: '700c',
        color: 'Red',
        material: 'Carbon',
        dicipline: 'Road',
        gender: 'Womens',
        image: 'Trek-Madone-SLR-6-Disc-Project-One'
      },
      {
        name: 'Cube Acid 200 2020',
        brand: 'Cube',
        price: 299.00,
        description: 'The Acid 200 is every inch a junior version of its adult counterpart, from the Shimano 7 speed transmission to the front and rear V brakes and new width CUBE tyres. We tailored details like the brake levers for small hands, so your junior rider will be tackling the trail and not equipment that doesn’t fit them',
        featured: true,
        electric: false,
        wheelSize: '20"',
        color: 'Green',
        material: 'Aluminium',
        dicipline: 'MTB',
        gender: 'Kids',
        image: 'Cube-Acid-200-2020'
      },
      {
        name: 'Cube Access 240 Disc 2020',
        brand: 'Cube',
        price: 399.99,
        description: 'The Access 240 Disc is the bike that all youngsters will want. Light, strong and equipped with everything they’ll need to help her keep up with her friends and family, it’s got all the features that you’ll find on our adult mountain bikes.',
        featured: true,
        electric: false,
        wheelSize: '24"',
        color: 'Aqua',
        material: 'Aluminium',
        dicipline: 'MTB',
        gender: 'Kids',
        image: 'Cube-Access-240-Disc-2020'
      },
      {
        name: 'Cannondale SuperSix Evo 105 2020',
        brand: 'Cannondale',
        price: '1999.99',
        description: 'The all-new SuperSix EVO is the fastest lightweight road bike there is. The SuperSix EVO is a pure road bike – a beautiful evolution of our classic race machine. We followed the proven recipe of the previous award-winning versions, while making it better in every possible way.',
        featured: true,
        electric: false,
        wheelSize: '700c',
        color: 'Black',
        material: 'Aluminium',
        dicipline: 'MTB',
        gender: 'Mens',
        image: 'Cannondale-SuperSix-Evo-105-2020'
      },
      {
        name: 'Cervelo S3 Disc Ultegra 2020',
        brand: 'Cervelo',
        price: 3999.99,
        featured: true,
        electric: false,
        description: 'If you are always chasing your next fastest ride, the new S3 aero road bike will give you every possible advantage. We made the S3 more aerodynamic and with an optimized balance of stiffness and compliance.',
        wheelSize: '700c',
        color: 'Black',
        material: 'Carbon',
        dicipline: 'Road',
        gender: 'Mens',
        image: 'Cervelo-S3-Disc-Ultegra-2020'
      },
      {
        name: 'Specialized Rockhopper Sport 29 2021',
        brand: 'Specialized',
        price: 449.00,
        description: 'All barn-burner and no benchwarmer, the Rockhopper Sport throws out the playbook when it comes to putting performance points on the board while playing some serious defense on behalf of your wallet.',
        featured: true,
        electric: false,
        wheelSize: '29"',
        color: 'Blue',
        material: 'Aluminium',
        dicipline: 'MTB',
        gender: 'Mens',
        image: 'Specialized-Rockhopper-Sport-29-2021'
      },
      {
        name: 'Transition Ripcord 2020',
        brand: 'Transition',
        price: 1599.95,
        description: 'The Ripcord complete bike is a powerhouse of a kids bike with a ton of features and no need to upgrade anything on the bike. RockShox air suspension front and rear makes it super easy to set up and change as the rider grows.',
        featured: true,
        electric: false,
        wheelSize: '24"',
        color: 'Blue',
        material: 'Aluminium',
        dicipline: 'MTB',
        gender: 'Womens',
        image: 'Transition-Ripcord-2020'
      },
      {
        name: 'Transition Patrol Carbon X01 2020',
        brand: 'Transition',
        price: 4999.99,
        description: 'This is our top of the line flagship Patrol that doesn’t get any better. Top shelf spec that isn’t too over the top but gives you everything you want in all the right places. Suspension is everything, so our build starts off with top-of-the-line Fox suspension that allows you to tune your bike to your specific riding.',
        featured: true,
        electric: false,
        wheelSize: '27.5"',
        color: 'Grey',
        material: 'Aluminium',
        dicipline: 'MTB',
        gender: 'Mens',
        image: 'Transition-Patrol-Carbon-X01-2020'
      },
      {
        name: 'Specialized Stumpjumper Expert Carbon 29 2020',
        brand: 'Specialized',
        price: 1299.99,
        description: 'This is the bike that’s consistently reaped kudos from the cycling media and countless riders. Why all the accolades? Our asymmetric carbon chassis delivers a perfect blend of bump-devouring suspension and effortless control. Technically speaking, this thing rips.',
        featured: true,
        electric: false,
        wheelSize: '29"',
        color: 'Grey',
        material: 'Aluminium',
        dicipline: 'MTB',
        gender: 'Mens',
        image: 'Specialized-Stumpjumper-Expert-Carbon-29-2020'
      },
      {
        name: 'Genesis Tour De Fer 30 2020',
        brand: 'Genesis',
        price: 1799.99,
        description: 'The bike you turn to if you were to quit your job and embark on an impromptu pedal-powered world tour! Build-wise, we dressed the frame with durable, no-nonsense components that we knew from personal experience are tour/expedition worthy and should last the sorts of high-mileages for which the bike was intended.',
        featured: true,
        electric: false,
        wheelSize: '700c',
        color: 'Blue',
        material: 'Steel',
        dicipline: 'MTB',
        gender: 'Mens',
        image: 'Genesis-Tour-De-Fer-30-2020'
      },
      {
        name: 'Kona Sutra 2020',
        brand: 'Kona',
        price: 1449.00,
        description: 'The Sutra is many things. It’s gorgeous. It’s stylish. It’s incredibly versatile, and it comes ready for the long haul on the bike tour of your dreams. Our Kona Cromoly steel frame is outfitted with a  Brooks saddle, cork bar tape, BarCon shifters, fenders and rack.',
        featured: true,
        electric: false,
        wheelSize: '700c',
        color: 'Green',
        material: 'Steel',
        dicipline: 'MTB',
        gender: 'Womens',
        image: 'Kona-Sutra-2020'
      },
      {
        name: 'Yeti SB130 C-Series 2020',
        brand: 'Yeti',
        price: 4599.99,
        description: 'The rebel yell of the middle child. Fed a steady diet of super-tech climbs. Refined to perfection by the demands of blistering speed. The SB130 was built to crush the biggest terrain. But before you put it in a box where full backpacks and all-day pain define the game, keep in mind this bike was also designed to be tossed around and toyed with.',
        featured: true,
        electric: false,
        wheelSize: '700c',
        color: 'Dark Anthracite',
        material: 'Carbon',
        dicipline: 'MTB',
        gender: 'Mens',
        image: 'Yeti-SB130-C-Series-2020'
      }
];

bikes.forEach((bike) => {
    let newBike = new Bike;
    newBike.name = bike.name;
    newBike.brand = bike.brand;
    newBike.price = bike.price;
    newBike.description = bike.description;
    newBike.featured = bike.featured;
    newBike.electric = bike.electric;
    newBike.wheelSize = bike.wheelSize;
    newBike.color = bike.color;
    newBike.material = bike.material;
    newBike.dicipline = bike.dicipline;
    newBike.gender = bike.gender;
    newBike.image = loadBikeImageFromFolder(bike.image);
    newBike.save();
});



//------------------------- Helpers -----------------------------------------//

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

function loadBikeImageFromFolder(name) {
  const file = process.cwd() + '/public/images/bike-images/' + name + '.jpg';
  let data = fs.readFileSync(file);
  let buff = Buffer.from(data);
  let base64data = buff.toString('base64');
     return base64data;
}