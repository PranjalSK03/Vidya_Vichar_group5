// Students.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
	},
	password: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	roll_no: {
		type: String,
		required: true
	},
	is_TA: [{//contains list of course ids where student is TA
		type: String,
	}],
    courses_id_request: [{
    	type: String,
    	required: true
    }],
    courses_id_enrolled: [{
    	type: String,
    	required: true
    }],
	batch: {
		type: String,
		enum: ['M.Tech', 'B.Tech', 'PHD', 'MS'],
		required: true
	},
	branch: {
		type: String,
		enum: ['CSE', 'ECE'],
		required: true
	}
});

module.exports = mongoose.model('Student', StudentSchema);
