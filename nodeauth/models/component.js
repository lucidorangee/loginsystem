var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/nodeauth');

var db = mongoose.connection;

var ComponentSchema = mongoose.Schema({
    name: {
        type: String
    },
    quantity: {
        type: String
    }
});

var Component = module.exports = mongoose.model('Component', ComponentSchema);

module.exports.getComponentById = function(id, callback){
    Component.findById(id, callback);
}

module.exports.getComponentbyName = function (componentname, callback){
    var query = {componentname: componentname};
    Component.findOne(query, callback);
}

module.exports.createComponent = function (newComponent, callback) {
    console.log(newComponent.name);
    newComponent.save()
}

module.exports.getAllComponents = function(callback){
    Component.find({}, function(err, users){
        users.forEach(function(user){
            //userMap[user._id] = user;
            console.log(user.name);
            
        });

        
    });
}