const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

mongoose.connect("mongodb://localhost:27017/tryFoodDb1");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const foodSchema = new mongoose.Schema(
    {   
        name: String,     
        photos_url: String,
        url: String,
        price_range: Number,
        user_rating: {
            rating_text: String,
            votes: Number,
            aggregate_rating: Number
        },
        menu: [
            {
                foodName: String,
                price: Number,
                rating: Number
            }
        ],
        coupons: [
            {
                card: String,
                discount: Number
            }
        ],
        average_cost_for_two: Number,
        cuisines: String,
        location: {
            latitude: Number,
            address: String,
            city: String,
            zipcode: Number,
            longitude: Number,
            locality: String
        },
        featured_image: String,
        currency: String
    }
);

const zomFoodOb = new mongoose.model("zomFoods", foodSchema, "zomFoods");
const swigFoodOb = new mongoose.model("swigFoods", foodSchema, "swigFoods");

app.get("/", (req, res)=>{
    res.render("home");
});

app.post("/",async (req, res)=>{
    let dish = req.body.foodName;
    let resName = req.body.restaurantName;
    let card = req.body.card;
    
    const dataZom = await zomFoodOb.find();
    const dataSwig = await swigFoodOb.find();

    let ZomFoodCost;
    let SwigFoodCost;
    let zomResURL;
    let swigResURL, ZomOrgFoodCost, SwigOrgFoodCost, couponDiscZom, couponDiscSwig;
    dataZom.forEach(restaurant => {
        // console.log(restaurant.name);
        if(restaurant.name === resName){
            zomResURL = restaurant.url;
            restaurant.menu.forEach(foodItem=>{
                // console.log(foodItem.name);
                if(foodItem.foodName === dish){
                    ZomFoodCost = foodItem.price;
                    ZomOrgFoodCost = foodItem.price;
                }
            })
            if(card){
                restaurant.coupons.forEach(coupon=>{
                    if(coupon.card === card){
                        couponDiscZom = coupon.discount;
                        ZomFoodCost -=(ZomFoodCost)*(coupon.discount)/100;
                    }
                })
            }
            // res.write("Final Price in Zomato " + ZomFoodCost + "\n");
        }
    });
    dataSwig.forEach(restaurant => {
        // console.log(restaurant.name);
        if(restaurant.name === resName){
            swigResURL = restaurant.url;
            restaurant.menu.forEach(foodItem=>{
                if(foodItem.foodName === dish){
                    SwigFoodCost = foodItem.price;
                    SwigOrgFoodCost = foodItem.price;
                }
            })
            if(card){
                restaurant.coupons.forEach(coupon=>{
                    if(coupon.card === card){
                        couponDiscSwig = coupon.discount;
                        SwigFoodCost -=(SwigFoodCost)*(coupon.discount)/100;
                    }
                })
            }
            // res.write("Final Price in Swiggy " + SwigFoodCost);
        }
    });
    // console.log(ZomFoodCost);
    // console.log(SwigFoodCost);
    // res.send();
    res.render("resultRate", {"zomOrgCost": ZomOrgFoodCost, "swigOrgCost": SwigOrgFoodCost, "card": card, "resName": resName, "zomResURL": zomResURL, "swigResURL": swigResURL, "ZomFinalPrice": ZomFoodCost, "SwigFinalPrice": SwigFoodCost, "couponDiscZom": couponDiscZom, "couponDiscSwig": couponDiscSwig, "foodItem": dish});
});

app.post("/foodPrice",async (req, res)=>{
    let userBudget = req.body.budget;
    const dataZom = await zomFoodOb.find();
    const dataSwig = await swigFoodOb.find();
    let availableFoodItems = [];
    
    dataZom.forEach(restaurant=>{
        let nameOfRes = restaurant.name;
        restaurant.menu.forEach(foodItem=>{
            if(foodItem.price <= userBudget){
                let x = {};
                x.resName = nameOfRes;
                x.foodName = foodItem.foodName;
                x.price = foodItem.price;
                x.rating = Math.floor(foodItem.rating);
                availableFoodItems.push(x);
                // console.log(x);
            }
        })
    })
    // availableFoodItems.sort({rating: -1})
    availableFoodItems.sort(function(a,b) {
        return b.rating - a.rating;
    });
    
    // console.log(availableFoodItems);
    res.render("BudgetResult2", {"foods": availableFoodItems, "budget": userBudget});
})

app.get("/about", (req,res)=>{
    res.render("about");
})

app.listen(3000, ()=>{
    console.log("Listening in Port 3000");
});