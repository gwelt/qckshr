module.exports = Hook;
const io = require('socket.io-client');
var socket = undefined;

function Hook(config) {
	this.config = config;
	socket = io(config.socket_server_URL);
	socket.on('connect', function() {
		console.log(new Date().toISOString()+' | '+socket.id);
		socket.emit('join',[].concat(Array.isArray(config.qckshr_rooms)?config.qckshr_rooms:[]));
	});
	return this;
}

Hook.prototype.trigger = function (text,obj) {
	socket.emit('message',text+' '+obj.name+' '+obj.size,{rooms:[].concat(Array.isArray(this.config.qckshr_rooms)?this.config.qckshr_rooms:[])});
}
