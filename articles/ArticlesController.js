const express = require('express');
const router = express.Router()
const slugify = require('slugify')

const Article = require('./Article')
const Category = require('../categories/Category')

const adminAuth = require('../middlewares/adminAuth');


router.get("/admin/articles", adminAuth, (req, res) => {
    res.locals.title = "GuiaPress - Admin"

    Article.findAll({
        include: [{model: Category}]
    }).then(articles => {
        res.render('admin/articles/index', {articles: articles})
    })
})

router.get("/admin/articles/new", adminAuth, (req, res) => {
    res.locals.title = "GuiaPress - Admin"

    Category.findAll().then(categories => {
        res.render("admin/articles/new", {categories: categories})
    })
})

router.post("/admin/articles/insert", adminAuth, (req, res) => {
    var title = req.body.title
    var body = req.body.body
    var category = req.body.category

    if (!title || !body) {
        res.redirect('/admin/articles/new' + id)
    }

    Article.create({
        title: title, 
        slug: slugify(title.toLowerCase()),
        body: body,
        categoryId: category
    }).then(() => {
        res.redirect('/admin/articles')
    })
})

router.post("/admin/articles/delete", adminAuth, (req, res) => {
    var id = req.body.id

    if (id != undefined && !isNaN(id)) {
        Article.destroy({
            where: {id: id}
        }).then(() => {
        res.redirect('/admin/articles')
        })
    } else {
        res.redirect('/admin/articles')
    }
})

router.get("/admin/articles/edit/:id", adminAuth, (req, res) => {
    res.locals.title = "GuiaPress - Admin"
    var id = req.params.id

    if (isNaN(id)) {
        res.redirect('/admin/articles')
    }

    Article.findByPk(id).then(article => {
        if(article != undefined) {
            Category.findAll().then(categories => {
                res.render('admin/articles/edit', {article: article, categories: categories})
            })
        } else {
            res.redirect('/admin/articles')
        }
    })
})

router.post("/admin/articles/update", adminAuth, (req, res) => {
    var id = req.body.id
    var title = req.body.title
    var body = req.body.body
    var category = req.body.category

    if (!title || !body) {
        res.redirect('/admin/articles/edit/' + id)
    }

    Article.update({
        title: title, 
        slug: slugify(title.toLowerCase()),
        body: body,
        categoryId: category
    }, {
        where: {id: id}
    }).then(() => {
        res.redirect('/admin/articles')
    })
})


module.exports = router