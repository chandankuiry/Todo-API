var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db=require('./db.js');
var bcrypt=require('bcrypt');
var middleware=require('./middleware.js')(db); //we create module.export to pass into database so i use (db)
//to access the middleware we passed this under every app.get('url',middleware.requireAuthentication,function()) like this
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

// GET /todos?completed=true(qyery parameter)
app.get('/todos',middleware.requireAuthentication ,function(req, res) {
	var query = req.query;
	var where={};
	if (query.hasOwnProperty('completed') && query.completed === 'true'){
		where.completed =true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false'){
		where.completed=false;
	}
	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description ={
			$like: '%' +query.q +'%'
		};
	}
	db.todo.findAll({where:where}).then(function (todos) {
		res.json(todos);

	}, function (e) {
		res.status(500).send();	
	});
});

	/*var filteredTodos = todos;
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
	res.json(filteredTodos);*/
//});

// GET /todos/:id
app.get('/todos/:id',middleware.requireAuthentication , function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	db.todo.findById(todoId).then(function (todo) {
		if (!!todo){
			res.json(todo.toJSON());

		}else {
			res.status(404).send();
		}	
	}, function (e) {
		res.status(500).send();
	});
});	
	/*var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}*/
//});

// POST /todos
app.post('/todos',middleware.requireAuthentication,function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function (todo) {
		req.user.addTodo(todo).then(function () {
			//if something upadte then reload the user todo
			return todo.reload();
		}).then(function (){
			//now print the reload todos
			res.json(todo.toJSON());
		});
		
	}, function(e) {
		res.status(400).json(e);
		
	});
});	

		/*//isBoolean,isString is builtin function of underscore library .trim() is used for avoid space
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}
	body.description = body.description.trim();
	// trim() is also used  for avoid hacking
	// add id field
	body.id = todoNextId++;
	// push body into array
	todos.push(body);
	res.json(body);*/
//});	

//DELETE /todos/:id
app.delete('/todos/:id',middleware.requireAuthentication  ,function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	db.todo.destroy({
		where:{
			id:todoId
		}
	}).then(function (rowsDeleted) {
		if(rowsDeleted === 0){
			res.status(404).json({
				error: 'No todo with this id'
			});
		}else {
			res.status(204).send();
		}
	},function () {

		res.status(500).send();
	});
});	
	/*var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	if (!matchedTodo) {
		res.status(404).json({
			"error": "no todo found with that id"
		});
	} else {
		/*todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}*/

//});
//PUT and UPDATE
app.put('/todos/:id',middleware.requireAuthentication  ,function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body=_.pick(req.body, 'description','completed');
	var attributes ={};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}
	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	},function () {
		res.status(500).send();
	});
});

	/*var matchedTodo = _.findWhere(todos, {
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
*/
//});
app.post('/users',function (req,res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function (user) {
		res.json(user.toPublicJSON());//why we change see user.js
	}, function(e) {
		res.status(400).json(e);
		
	});

});

//POST/users/login
app.post('/users/login', function (req,res) {
	var body =_.pick(req.body,'email','password');

	db.user.authenticate(body).then(function (user) {
		var token=user.generateToken('authentication');
		if (token){
			res.header('Auth',token).json(user.toPublicJSON());
		} else{
			res.status(401).send();

		}
		
	}, function () {
		res.status(401).send();
	});

});




db.sequelize.sync({force:true}).then(function (){
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
	
});
