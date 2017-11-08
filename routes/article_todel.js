const express = require("express")
const router = express.Router()

//Models
let Article = require("../models/article")
let User = require("../models/user")







router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("article/add")
})

// Add submit POST Routes
router.post("/add", ensureAuthenticated, (req, res) => {

  req.checkBody("title", "Title is required.").not().isEmpty()
  req.checkBody("body", "Body is required").not().isEmpty()

  const errors = req.validationErrors();
  if (errors) {
    for (let error of errors) {
      req.flash("danger", error.msg)
    }
    res.render("article/add")
  } else {
    let article = new Article()
    article.title = req.body.title
    article.author = req.user._id
    article.body = req.body.body

    article.save((err) => {
      if (err) {
        console.log(err)
      } else {
        req.flash("success", "Article added.")
        res.redirect("/")
      }
    })
  }
})

//Get single article
router.get("/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if(err) {
      console.log(err)
    } else {
      User.findById(article.author, (err, user) => {
        res.render("article/show", {article: article, author: user.name})
      })

    }
  })
})

//Edit single article
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if(err) {
      console.log(err)
    } else {
      if(article.author != req.user._id) {
        req.flash("danger", "You are not authorized to edit this article.")
        res.redirect("/article/" + article._id)
      } else {
        res.render("article/edit", {article: article})
      }
    }
  })
})
router.post("/edit/:id", ensureAuthenticated, (req, res) => {

  req.checkBody("title", "Title is required.").not().isEmpty()
  req.checkBody("author", "Author is required.").not().isEmpty()
  req.checkBody("body", "Body is required").not().isEmpty()

  const errors = req.validationErrors();
  if (errors) {
    for (let error of errors) {
      req.flash("danger", error.msg)
    }
    res.redirect("/article/edit/" + req.params.id)
  } else {
    let article = {}
    article.title = req.body.title
    article.author = req.user._id
    article.body = req.body.body

    let query = {_id: req.params.id}

    Article.update(query, article, (err, article) => {
      if(err) {
        console.log(err)
      } else {
        if(article.author != req.user._id) {
          req.flash("danger", "You are not authorized to edit this article.")
          res.redirect("/article/" + article._id)
        } else {
          req.flash("success", "Article  edited.")
          res.redirect("/article/" + req.params.id)
        }
      }
    })
  }
})
router.delete("/:id", (req, res) => {

  if(!req.user._id) {
    res.status(500).send()
  }

  Article.findById(req.params.id, (err, article) => {
    if(err) {
      console.log(err)
    } else {
      if(article.author != req.user._id) {
        res.status(500).send()
      } else {
        let query = {_id: req.params.id}
        Article.remove(query, (err) => {
          if (err) {
            console.log(err);
          } else {
            res.send("Success")
          }
        })
      }
    }
  })
})

//Access control
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next()
  } else {
    req.flash("danger", "Please Login")
    res.redirect("/user/login")
  }
}

module.exports = router
