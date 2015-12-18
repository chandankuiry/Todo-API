var bcrypt =require('bcrypt');
var _=require('underscore');
module.exports=function (sequelize, DataTypes) {
	return sequelize.define('user', {
		email: {
			type:DataTypes.STRING,
			allowNull:false,
			unique:true, //unique property does that if we sign up with an existing email(which already use in signup) it show error
			validate: {
				isEmail: true //it check the string is email or not		}
	
			}
		},
		salt: {
			type:DataTypes.STRING,
		},
		password_hash: {
			type:DataTypes.STRING

		},
		password: {
			type:DataTypes.VIRTUAL,
			allowNull:false,
			validate: {
				len:[7, 100]//password should be 7-100 letter
			},
			set: function(value){
				var salt=bcrypt.genSaltSync(10);//it add salt
				var hashedPassword=bcrypt.hashSync(value,salt);
				this.setDataValue('password',value);
				this.setDataValue('salt',salt);
				this.setDataValue('password_hash',hashedPassword );


			}
		}
	}, {
		hooks: {
			beforeValidate: function (user, options){
				if (typeof user.email === 'string') {
					user.email=user.email.toLowerCase();
				}
			}
		},
		// to secure our password more efficiently that we don't want to return our password 
		instanceMethods: {
			toPublicJSON: function(){
				var json =this.toJSON();
				//we want to return id,email,createdAt,updatedAt we don't want to print password,password_hash,salt
				return _.pick(json,'id','email','createdAt','updatedAt');

			}
		}
				

	});	

};		