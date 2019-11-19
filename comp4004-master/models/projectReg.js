var mongoose = require('mongoose');


// project Schema


var projectSchema = mongoose.Schema({
	projectName: {
		type: String,
	},
	owner: {
		type: String
	}
});






var projectReg = module.exports = mongoose.model('projectReg', projectSchema);


module.exports.createProject = function(newProject, callback){


	        
	        newProject.save(callback);
	   
	
};