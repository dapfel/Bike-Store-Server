const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

function initializeDbConnection(passport) {
    mongoose.connect("mongodb://localhost:27017/bikeStoreDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    mongoose.set("useCreateIndex", true);
    
    const userSchema = new mongoose.Schema({
      username: String,
      password: String,
      cartItemIds: [String],
      creditCard: {String: num, String: exp, String: ccv}
    });
    
    userSchema.plugin(passportLocalMongoose);
    
    const User = new mongoose.model("User", userSchema);
    
    passport.use(User.createStrategy());
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    const bikeSchema = new mongoose.Schema({
      name: String,
      brand: String,
      price: String,
      description: String,
      images: [Buffer]
    });

    const Bike = new mongoose.model("Bike", bikeSchema);
}

export default initializeDbConnection;
export {User, Bike};