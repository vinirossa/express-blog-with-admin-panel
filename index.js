const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const connection = require('./database/database')

const categoriesController = require('./categories/CategoriesController')
const articlesController = require('./articles/ArticlesController')
const usersController = require('./users/UserController')
const Article = require('./articles/Article')
const Category = require('./categories/Category');
const User = require('./users/User')

// View engine
app.engine('html', require('ejs').renderFile)
app.set("view engine", "ejs")

// Sessions
app.use(session({
    secret: "6edf8aaca88b6839f6b44607abd8dd20",
    cookie: { maxAge: 30000000 }
    // Usar Redis
}))

// Static
app.use(express.static('public'))

// Body parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Database
connection
    .authenticate()
    .then(() => {
        console.log("Conexão realizada com o banco de dados.")
    })
    .catch((error) => {
        console.log(error)
    })


// Model Routes
app.use("/", categoriesController)
app.use("/", articlesController)
app.use("/", usersController)

// Index Routes
app.get("/", (req, res) => {
    res.locals.title = "GuiaPress"

    Article.findAll({
        order: [
            ['id', 'DESC']
        ],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render("index", { articles: articles, categories: categories })
        })
    })
})

app.get("/:slug", (req, res) => {
    res.locals.title = "GuiaPress"
    var slug = req.params.slug

    Article.findOne({
        where: { slug: slug }
    }).then(article => {
        if (article != undefined) {
            Category.findAll().then(categories => {
                res.render("article", { article: article, categories: categories })
            })
        } else {
            res.redirect("/")
        }
    }).catch(err => {
        res.redirect("/")
    })
})

app.get("/category/:slug", (req, res) => {
    res.locals.title = "GuiaPress"
    var slug = req.params.slug

    Category.findOne({
        where: { slug: slug },
        include: [{ model: Article }]
    }).then(category => {
        if (category != undefined) {
            Category.findAll().then(categories => {
                res.render("index", { articles: category.articles, categories: categories })
            })
        } else {
            res.redirect("/")
        }
    }).catch(err => {
        res.redirect("/")
    })
})

app.get("/page/:num", (req, res) => {
    res.locals.title = "GuiaPress"
    let page = req.params.num
    let offset = 0

    offset = (isNaN(page) || page == 1) ? 0 : (parseInt(page) - 1) * 4

    Article.findAndCountAll({
        order: [
            ['id', 'DESC']
        ],
        limit: 4,
        offset: offset
    }).then(articles => {

        let next = true

        if (offset + 4 >= articles.count) next = false

        var result = {
            page: parseInt(page),
            next: next,
            articles: articles
        }

        Category.findAll().then(categories => {
            res.render('page', { result: result, categories: categories })
        })
    })

})

// Localhost
app.listen(8080, () => { console.log("App rodando...") })