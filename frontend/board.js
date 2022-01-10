class Board {
	constructor () {
		// Board Variables
		this.x_axis = [...Array(8).keys()].map(i => i+1);
		this.y_axis = [...Array(8).keys()].map(i => i+1);
		this.cp_dict = this.create_coord_to_pos_dict();
		this.current_board = [...Array(8)].map(x => Array(8));
		this.previous_board = [...Array(8)].map(x => Array(8));
	}

	create_coord_to_pos_dict(){
		let dict = {"x":{"center":{}, "bound":{}}, "y":{"center":{}, "bound":{}}};
		for (let i=1; i < 9; i++) {
			// flip coordinate system. index [0, 0] is top left, but A1 is bottom left
			var square_center_x = round((i-1)*SQR_SIZE+BOARD_ORIGIN[0]+(SQR_SIZE/2));
			var square_center_y = round((8-i)*SQR_SIZE+BOARD_ORIGIN[1]+(SQR_SIZE/2));
			var start_x = round(square_center_x - (SQR_SIZE/2));
			var end_x = round(square_center_x + (SQR_SIZE/2));

			var start_y = round(square_center_y - (SQR_SIZE/2));
			var end_y = round(square_center_y + (SQR_SIZE/2));
			dict["x"]["center"][i] = square_center_x;
			dict["x"]["bound"][i] = start_x;
			dict["y"]["center"][i] = square_center_y;
			dict["y"]["bound"][i] = start_y;
		};
		return dict
	}

	coord_to_pos(coord){
		let [x, y] = coord;
		if ((x >= 1) && (x <= 8) && (y >= 1) && (y <= 8)){
			let coord_center = [this.cp_dict["x"]["center"][x], this.cp_dict["y"]["center"][y]];
			let bounds = [this.cp_dict["x"]["bound"][x], this.cp_dict["y"]["bound"][y]];
			return [coord_center, bounds];
		}
		return null;
	}

	pos_to_coord(pos){
		let x = pos[0];
		let y = pos[1];
		for (let i=1;i<=8;i++){
			for (let j=1;j<=8;j++){
				let coord = [i, j]
				let start_tuple = this.coord_to_pos(coord)[1];
				let end_tuple = start_tuple.map(x => x+SQR_SIZE);
				if (start_tuple[0] <= x  && x <= end_tuple[0] && start_tuple[1] <= y && y <= end_tuple[1]){
					return coord;
				}
			}
		}
		return null;
	}

	get_piece_on_coord(coord){
		let [i, j] = this.coord_to_index(coord);
		return this.current_board[i][j];
	}

	set_piece_on_coord(piece, coord, req_board="current"){
		if (req_board === "current"){
			let [i, j] = this.coord_to_index(coord);
			this.current_board[i][j] = piece;
		}
		else{
			let [i, j] = this.coord_to_index(coord);
			this.previous_board[i][j] = piece;
		}
	}

	remove_piece_on_coord(coord){
		let [i, j] = this.coord_to_index(coord);
		let piece = this.current_board[i][j];
		if (piece){
			this.current_board[i][j] = null;
			return piece;
		}
		return null;
	}

	check_for_checks(){
		// Check if one of the enemy pieces on the board had a legal move 
		// that takes your king. We can't loop over enemy pieces, because
		// This function is also called upon hypotheticalmoves, where 
		// The pieces are not actually moved, only the current board
		// configuration is changed. 
		for (let i=0;i<this.current_board.length;i++){
			let row = this.current_board[i];
			for (let j=0;j<row.length;j++){
				let piece = row[j];
				if (! piece) {continue;}
				if (piece.color != player.color){
					let legal_moves = piece.get_legal_moves();
					for (let k=0;k<legal_moves.length;k++){
						let move = legal_moves[k];
						// Dont put in check when a pawn is in front of the king
						// if ((piece instanceof Pawn)){}
						let piece2 = this.get_piece_on_coord(move)
						if ((piece2 instanceof King) && (piece2.color == player.color)){
							player.check = true
							return true
						}
					}
				}
			}
		}
		player.check = false
		return false
	}

	check_for_checkmate(){
		let has_legal_moves = player.check_for_legal_moves();
		if (!has_legal_moves && this.check_for_checks()){
			print("CHECKMATE!")
			return true
		}
		return false
	}

	coord_to_index(coord){
		let [x, y] = coord;
		let i = 8-y;
		let j = x-1;
		return [i, j];
	}

	coord_addition(coord1, coord2){
		let new_coord = coord1.map((x, i) => x + coord2[i]);
		if (0 < new_coord[0] && new_coord[0] <= 8 && 0 < new_coord[1] && new_coord[1] <= 8){
			return new_coord
		}
		return null;
	}

	coord_comparison(coord1, coord2){
		return (coord1.toString() === coord2.toString());
	}

	coord_in_list(coord1, list){
		return list.some(row => (row[0] == coord1[0] && row[1] == coord1[1]));
	}

	set_previous_to_current(){
		let new_board = this.previous_board.slice();
		this.current_board = new_board;
	}

	display(){
		let colors = [color("black"), color("white")];
		let color_i = 0;
		for (let i = 1; i < 9; i++) {
			for (let j = 1; j < 9; j++) {
				var bounds = this.coord_to_pos([i, j])[1];
				var left = bounds[0];
				var top = bounds[1];
				var c = colors[color_i];
				fill(c);
				noStroke();
				rect(left, top, SQR_SIZE, SQR_SIZE);
				color_i += 1;
				color_i = color_i%2;
			};
			color_i += 1;
			color_i = color_i%2;
		};
	}
}