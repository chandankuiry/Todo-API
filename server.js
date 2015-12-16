var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

// GET /todos?completed=true(qyery parameter)
app.get('/todos', function(req, res) {
	var queryparams = req.query;
	var filteredTodos = todos;
	// for "completed" section
	if (queryparams.hasOwnProperty('completed') && queryparams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});
	} else if (queryparams.hasOwnProperty('completed') && queryparams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});

	}
	//FOR "description" section
	if (queryparams.hasOwnProperty('q') && queryparams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.toLowerCase().indexOf(queryparams.q.toLowerCase()) > -1;
			//toLowerCase is used for for advencd searching like if i type work then it can find the word WORK alsoP

		});
	}
	res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
});

// POST /todos
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	//isBoolean,isString is builtin function of underscore library .trim() is used for avoid space
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}
	body.description = body.description.trim();
	// trim() is also used  for avoid hacking
	// add id field
	body.id = todoNextId++;

	// push body into array
	todos.push(body);

	res.json(body);
});
//DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	if (!matchedTodo) {
		res.status(404).json({
			"error": "no todo found with that id"
		});
	} else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}

});
//PUT and UPDATE
app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};
	if (!matchedTodo) {
		res.status(404).send();
	}
	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		res.status(400).send();
	}
	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		res.status(400).send();
	}
	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);

});
app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});