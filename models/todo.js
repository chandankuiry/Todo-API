module.exports=function (sequelize, DataTypes) {
	return sequelize.define('todo', {
		description: {
			type: DataTypes.STRING,
			allowNull: false, //because description should not be empty
			validate: {
				len: [1, 250] //here len property set that description character willbe >1 &<250

			}
		},

		completed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			//because completed should not be empty
			defaultValue: false
		}
	});
};