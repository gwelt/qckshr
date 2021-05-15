module.exports = Hook;
var config = require('./config.json');
const socket = require('socket.io-client')(config.socket_server_URL);

socket.on('connect', function() {
	console.log(new Date().toISOString()+' | '+socket.id)
	socket.emit('name',config.qckshr_name);
	socket.emit('join',[].concat(Array.isArray(config.qckshr_rooms)?config.qckshr_rooms:[]));
});

function Hook() {
	return this;
}

Hook.prototype.trigger = function (text,obj) {
	//console.log(text,obj.name,obj.size);
	socket.emit('message',text+' '+obj.name+' '+obj.size,{rooms:[].concat(Array.isArray(config.qckshr_rooms)?config.qckshr_rooms:[])});
}
