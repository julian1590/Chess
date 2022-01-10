module.exports = { 
	add_player: function(socket_id, all_rooms){
		for (const [room, room_data] of Object.entries(all_rooms)){
			console.log(room, room_data);
			if (!room_data.room_players["W"]){
				all_rooms[room].room_players["W"] = socket_id;
				return {color:"W", room:room};
			} else if (!room_data.room_players["B"]) {
				all_rooms[room].room_players["B"] = socket_id;
				return {color:"W", room:room};
			}
		}
		return false;
	},

	check_start: function(room){
		if (room.players_ready[0] && room.players_ready[1]){
			return true;
		} else { 
			return false
		}
	}

};

