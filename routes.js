var express = require("express");
var Zombie = require("./models/zombie");
var Arma = require("./models/arma");

var passport = require("passport");
var acl = require('express-acl');

var router = express.Router();

acl.config({
    defaultRole: 'invitado'
});

router.use(acl.authorize);

router.use((req,res,next)=>{
    res.locals.currentZombie = req.zombie;
    res.locals.errors=req.flash("error");
    res.locals.infos = req.flash("info");
    if(req.isAuthenticated()){
        req.session.role = req.zombie.role;
    }
    console.log(req.session);
    next();
});



router.get("/",(req,res,next)=>{
    Zombie.find()
    .sort({createAt:"descending"})
    .exec((err,zombies)=>{
        if(err){
            return next (err);
        }
        res.render("index",{zombies:zombies});
    });
});

router.get("/login",(req,res) =>{
    res.render("login");
});

router.post("/login",passport.authenticate("login",{
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

router.get("/logout",(req, res) =>{
    req.logout();
    res.redirect("/");
});
router.get("/edit", ensureAuthenticated,(req, res) => {
    res.render("edit");
});
router.post("/edit", ensureAuthenticated,(req, res, next) => {
    req.zombie.displayName = req.body.displayName;
    req.zombie.bio = req.body.bio;
    req.zombie.save((err) => {
        if(err){
            next(err);
            return;
        }
        req.flash("info","Perfil actualizado!");
        res.redirect("/edit");
    });
});

router.get("/signup",(req,res)=>{
    res.render("signup");
});

router.get("/interfaces",(req,res)=>{
    res.render("interfaces");
});

router.get("/datos",(req,res,next)=>{
    Arma.find()
    .sort({createAt:"descending"})
    .exec((err,armas)=>{
        if(err){
            return next (err);
        }
        res.render("datos",{armas:armas});
    });
});

router.post("/signup",(req,res,next)=>{
    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;

    Zombie.findOne({username:username}, function(err,zombie){
        if(err){
            return next(err);
        }
        if(zombie){
            req.flash("error","El nombre de usuario ya lo ha tomado otro zombie");
            return res.redirect("/signup");
        }
        var newZombie = new Zombie({
            username:username,
            password:password,
            role:role
        });
        newZombie.save(next);
        return res.redirect("/");
    });
});

router.post("/interfaces",(req,res,next)=>{
    var descripcion = req.body.descripcion;
    var categoria = req.body.categoria;
    var fuerza = req.body.fuerza;
    var municiones = req.body.municiones;

        var newArma = new Arma({
            descripcion:descripcion,
            categoria:categoria,
            fuerza: fuerza,
            municiones
        });
        newArma.save(next);
        return res.redirect("/datos");
    });



    function ensureAuthenticated(req, res, next){
        if(req.isAuthenticated()){
            next();
        }else{
            req.flash("info","Necesitas iniciar sesión para poder ver esta sección");
            res.redirect("/login");
        }
    }
module.exports = router;
