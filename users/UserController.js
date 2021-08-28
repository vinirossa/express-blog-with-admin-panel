const express = require('express');
const router = express.Router()
const bcrypt = require('bcryptjs');

const User = require('./User')

const adminAuth = require('../middlewares/adminAuth');


router.get("/admin/users", adminAuth, (req, res) => {
  res.locals.title = "GuiaPress - Admin"
  
  User.findAll().then(users => {
    res.render("admin/users/index", {users: users})
  })
})

router.get("/admin/users/new", adminAuth, (req, res) => {
  res.locals.title = "GuiaPress - Admin"

  res.render("admin/users/new")
})

router.post("/admin/users/insert", adminAuth, (req, res) => {
  var email = req.body.email
  var password = req.body.password

  User.findOne({where: {email: email}}).then(user => {
    if (user == undefined) {

      var salt = bcrypt.genSaltSync(10)
      var hash = bcrypt.hashSync(password, salt)
      
      if (email != undefined || password != undefined) {
        User.create({
          email: email,
          password: hash
        }).then(() => {
            res.redirect("/admin/users")
        })
      } else {
          res.redirect('/admin/users')
      }
      
    } else {
      res.redirect('/admin/users/new')
    }
  })
})

router.get("/login", (req, res) => {
  res.locals.title = "GuiaPress - Admin"

  res.render("admin/users/login")
})

router.post("/authenticate", (req, res) => {
  let email = req.body.email
  let password = req.body.password

  User.findOne({where: {email: email}}).then(user => {
    if (user != undefined) {

      var correct = bcrypt.compareSync(password, user.password)
      
      if (correct) {
        req.session.user = {
          id: user.id,
          email: user.email
        }
        res.redirect('/admin/categories')
      } else {
        res.redirect('/login')
      }
    } else {
      res.redirect('/login')
    }
  })
})

router.get("/logout", (req, res) => {
  req.session.user = undefined
  res.redirect("/")
})


module.exports = router