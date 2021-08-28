const express = require('express')
const router = express.Router()
const slugify = require('slugify')

const Category = require('./Category')

const adminAuth = require('../middlewares/adminAuth');


router.get("/admin/categories", adminAuth, (req, res) => {
    res.locals.title = "GuiaPress - Admin"

    Category.findAll().then(categories => {
        res.render('admin/categories/index', {categories: categories})
    })
})

router.get("/admin/categories/new", adminAuth, (req, res) => {
    res.locals.title = "GuiaPress - Admin"
    res.render('admin/categories/new')
})

router.post("/admin/categories/insert", adminAuth, (req, res) => {
    var title = req.body.title

    if (title != undefined) {
        Category.create({
            title: title,
            slug: slugify(title.toLowerCase())
        }).then(() => {
            res.redirect("/admin/categories")
        })
    } else {
        res.redirect('/admin/categories/new')
    }
})

router.post("/admin/categories/delete", adminAuth, (req, res) => {
    var id = req.body.id

    if (id != undefined && !isNaN(id)) {
        Category.destroy({
            where: {id: id}
        }).then(() => {
        res.redirect('/admin/categories')
        })
    } else {
        res.redirect('/admin/categories')
    }
})

router.get("/admin/categories/edit/:id", adminAuth, (req, res) => {
    res.locals.title = "GuiaPress - Admin"
    var id = req.params.id

    if (isNaN(id)) {
        res.redirect('/admin/categories')
    }

    Category.findByPk(id).then(category => {
        if(category != undefined) {
            res.render('admin/categories/edit', {category: category})
        } else {
            res.redirect('/admin/categories')
        }
    })
})

router.post("/admin/categories/update", adminAuth, (req, res) => {
    var id = req.body.id
    var title = req.body.title

    if (!title) {
        res.redirect('/admin/categories/edit/' + id)
    }

    Category.update({title: title, slug: slugify(title.toLowerCase())}, {
        where: {id: id}
    }).then(() => {
        res.redirect('/admin/categories')
    })
})

module.exports = router