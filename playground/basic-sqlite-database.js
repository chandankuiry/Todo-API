var Sequelize =require('sequelize');
var sequelize=new Sequelize(undefined,undefined,undefined,{
	'dialect':'sqlite',
	'storage':__dirname + '/basic-sqlite-database.sqlite'      
});
var Todo =sequelize.define('todo', {
	description:{
		type:Sequelize.STRING,
		allowNull: false,//because description should not be empty
		validate:{
			len:[1,250] //here len property set that description character willbe >1 &<250

		}
	},

	completed:{
		type:Sequelize.BOOLEAN,
		allowNull: false,
		//because completed should not be empty
		defaultValue: false
	}
});
//force: true  because forcely we recreate the table
sequelize.sync({force: true}).then(function () {
	console.log('Everything is synced');
	Todo.create({
		description:'take out trash'
		
	}).then(function (todo) {
		return Todo.create({
			description:'clean office'
		});
		
	}).then(function (){
		//return Todo.findById(2)   //findById method find the todo if we given the id if not it show else block
		//another method is findAll() which find todo which as which we given in where clause 
		//and for this cause for multiple item found here so we have to set todos inspite of Todo in function parameter
		return Todo.findAll({
			where: {
				description:{
					$like: '%trash%'     // $like is very useful
				}

			}
		});
	}).then(function (todos) {
		if (todos){
			todos.forEach(function (todo){

				console.log(todo.toJSON());
			});
		}else {
			console.log('no todo found');
		}

	}).catch(function (e){
		console.log(e);
	});
});