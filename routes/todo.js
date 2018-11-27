var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ToDo = require('../models/ToDo.js');

/* GET ALL TODOS */
router.get('/', (req, res) => {
    ToDo.find((err, todos) => {
        if (err) return next(err);
        res.json(todos);
    });
});

/*SAVE A TODO*/
router.post('/', (req, res) => {
    ToDo.create(req.body, (err, post) => {
        if (err) return next(err);
        ToDo.find((err, todos) => {
            if (err) return next(err);
            res.json({ todos, success: true, msg: 'Tehtävä lisättiin onnistuneesti!' });
        });
    });
});

/*MARK TODO AS DONE*/
router.post('/add', (req, res) => {
    ToDo.findOne({
        _id: req.body.id
    }, (err, todo) => {
        if (err) throw err;
        //adds the user to the list of the users that have completed the task
        else if (-1 === todo.hasDone.indexOf(req.body.username)) {
            ToDo.findByIdAndUpdate(req.body.id,
                { $push: { hasDone: req.body.username } },
                { new: true },
                (err, todo) => {
                    if (err) return res.json({ success: false, msg: "error" });
                    res.json(todo)
                })
            //removes the user from list of the users that have completed the task
        } else {
            ToDo.findByIdAndUpdate(req.body.id,
                { $pull: { hasDone: req.body.username } },
                { new: true },
                (err, todo) => {
                    if (err) return res.json({ success: false, msg: "error" });
                    res.json(todo)
                })
        }
    });
});

/*REMOVE TODO FROM LIST*/
router.post('/remove', (req, res) => {
    //removes the todo and returns remaining todos to client
    ToDo.find().remove({ _id: req.body.id }).exec();
    ToDo.find((err, todos) => {
        if (err) return next(err);
        res.json(todos);
    });s
});


module.exports = router;