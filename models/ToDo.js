const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*hasDone consists of usernames that have completed the task*/
const ToDoSchema = new Schema({
    name: String,
    category: String,
    hasDone: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model('ToDo', ToDoSchema);