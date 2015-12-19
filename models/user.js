var bcrypt =require('bcrypt');
var _=require('underscore');
var cryptojs=require('crypto-js');
var jwt=require('jsonwebtoken');
module.exports=function (sequelize, DataTypes) {
	var user =sequelize.define('user', {
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
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						return reject();
					}
					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
							//compareSync check if body.password ,password_hash (look into user.js) are same or not
							return reject();
						}


						resolve(user); //if we set it toJSON then it also show the salt and password_hash
					}, function(e) {
						reject();


					});

				});
			},
			findByToken: function(token) {
				return new Promise(function (resolve,reject){
					try {
						var decodedJWT=jwt.verify(token ,'qwerty098');
						var bytes =cryptojs.AES.decrypt(decodedJWT.token,'abc123!@#!');
						//to convert it to actual jsonstring what we want 
						var tokenData=JSON.parse(bytes.toString(cryptojs.enc.Utf8));

						//to find the id  because in previous code we simply get mixed of id&type
						user.findById(tokenData.id).then(function (user){
							//to check user exist or not
							if(user) {
								resolve(user);
							} else {
								reject(); // if use account not exist

							}
							// if findById fail
						}, function(e) {
							reject();
							
						});
					} catch(e) {
						reject();
					}

				});
			}

		},
		// to secure our password more efficiently that we don't want to return our password 
		instanceMethods: {
			toPublicJSON: function(){
				var json =this.toJSON();
				//we want to return id,email,createdAt,updatedAt we don't want to print password,password_hash,salt
				return _.pick(json,'id','email','createdAt','updatedAt');

			},
			generateToken:function (type) {
				if (!_.isString(type)) {
					return undefined;
				}
				try {
					var stringData=JSON.stringify({id: this.get('id'),type:type});
					var encryptedData=cryptojs.AES.encrypt(stringData,'abc123!@#!').toString();//toString return our encrypted data
					var token=jwt.sign({
						token:encryptedData
					}, 'qwerty098');

					return token;

				} catch(e){
					console.error(e);
					return undefined;
				}
			}
		}
				

	});
	return user;	

};		