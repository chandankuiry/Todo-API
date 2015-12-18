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
		password: {
			type:DataTypes.STRING,
			allowNull:false,
			validate: {
				len:[7, 100]//password should be 7-100 letter
			}
		}		

	});	

}		