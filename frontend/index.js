const socket = io.connect("http://localhost:3000");

let my_color = null;
let enemy_id = null;

window.onload=function(){
	document.getElementById("join").addEventListener("click", () => {
		socket.emit("joined", socket.id);
	});
}

socket.on("accepted", (assignment_data) => {
	// disableButtons();
	// Let the server know this player is ready and send player data 
	try{
		socket.emit("ready", {color:assignment_data.color, room:assignment_data.room, id:socket.id});
	} catch (err) {
		console.log(err);
	}
});

socket.on("declined", () => {
	// disableButtons()
	console.log("declined")
});

socket.on("start", (connected_players) => {
	white_pieces = init_pieces("W");
	white_player = new Player("W", connected_players[0], white_pieces, 600);
	players[0] = white_player;

	black_pieces = init_pieces("B");
	black_player = new Player("B", connected_players[1], black_pieces, 600);
	players[1] = black_player;
	player = players[player_i];
	if (connected_players["W"] === socket.id) {
		my_color = "W";
		enemy_id = connected_players["B"];
	} else if (connected_players["B"]  === socket.id) {
		my_color = "B";
		enemy_id = connected_players["W"];
	}
	console.log("GAME STARTED");
});

socket.on("move", (moved) => {
	if (moved.player === enemy_id) {
		let moved_piece = board.get_piece_on_coord(moved.from);
		enemy_move = moved_piece.move(moved.to);
		last_move = enemy_move;
		player.picked_up_piece = null;
		player.selected_piece = null;
		game.next_player();
	}
});

function disableButtons(){
	document.getElementById("join-white").disabled = true
	document.getElementById("join-black").disabled = true
}
