class Game {
	next_player(){
		player_i = (player_i + 1)%2;
		player = players[player_i];
		if (player_i == 0){
			moves_done += 1;
		}
		board.check_for_checkmate();
		
	}

	get_opponent(){
		if (player.color == "W"){
			return black_player;
		}
		return white_player;
	}
}
