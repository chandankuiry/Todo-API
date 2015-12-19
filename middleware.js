module.exports=function (db){

	return {
		requireAuthentication: function(req,res,next){
			var token =req.get('Auth');//to get the token see server.js line 215
			db.user.findByToken(token).then(function (user){
				//findByToken class method are created in user.js
				req.user=user;
				next();//to execute the private code

			}, function(){
				res.status(401).send();

			});
		}
	};
}