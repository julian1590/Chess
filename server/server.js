const path        = require('path');
const http        = require('http');
const express     = require('express');
const sio      	  = require('socket.io');
const publicPath  = path.join(__dirname, "/../frontend");
const port = process.env.PORT || 3000;

let app = express();
let server = http.createServer(app);
let io = sio(server);

app.use(express.static(publicPath));

server.listen(port, ()=>{
	console.log(`Server is running on port ${port}`);
});


const game = require('./utils/gameManager')

let all_rooms = {"room1":{room_players:{"W":null, "B":null}, players_ready:[null, null]},
				"room2":{room_players:{"W":null, "B":null}, players_ready:[null, null]},
				"room3":{room_players:{"W":null, "B":null}, players_ready:[null, null]}};
let player_to_room = {};
let player_to_color = {};

io.on("connection", (socket) => {
	console.log("Made socket connection", socket.id);

	socket.on("disconnect", () => {
		console.log(`Socket ${socket.id} disconnected`);
	});

	socket.on("joined", async (socket_id) => {
		try{
			const assignment_data = await game.add_player(socket_id, all_rooms);
			if (assignment_data){
				player_to_room[socket_id] = assignment_data.room;
				player_to_color[socket_id] = assignment_data.color;
				socket.emit("accepted", assignment_data);
			} else {
				socket.emit("declined", "Seat is taken");
			}
		} catch(err) {
			console.log(err);
			socket.emit("error");
		}
	});

	socket.on("ready", async (player_data) => {
		let room = player_data.room;
		if (player_data.color === "W") {
			all_rooms[room].players_ready[0] = player_data.id;
		} else if (player_data.color === "B") {
			all_rooms[room].players_ready[1] = player_data.id;
		}
		const ready = await game.check_start(all_rooms[room]);
		if (ready) {
			socket.to(room).emit("start", all_rooms[room].room_players);
		} else {
			console.log("Waiting for players");
		}
	});

	socket.on("move", async (moved) => {
		let msg = {from:moved.from, to:moved.to, player:socket.id}
		let room = player_to_room[socket_id];
		// Send the move to the opposite player
		if (socket.id === connected_players["W"]) {
			socket.to(room).emit("move", msg);
		} else if (socket.id === connected_players["B"]) {
			socket.to(room).emit("move", msg);
		}
	});
});
