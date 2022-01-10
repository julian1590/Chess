class Piece {
	constructor(pos, coord, color){
		this.pos = pos;
		this.coord = coord;
		this.color = color;
	}

	display() {
		image(this.img, this.pos[0], this.pos[1], PIECE_SIZE, PIECE_SIZE);
	}

	get_center() {
		return this.pos.map(x=>x+SQR_SIZE/2);
	}

	move(new_coord){
		// set previous board position to what it is currently
		board.set_previous_to_current();
		let current_coord = this.coord;
		let bounds = board.coord_to_pos(new_coord)[1];
		let new_pos = bounds.map(x=>x+PIECE_OFFSET);
		let captured_piece = this.handle_capture(current_coord, new_coord); // can be None
		this.handle_castling(new_coord);
		board.set_piece_on_coord(this, new_coord);
		board.remove_piece_on_coord(current_coord);
		this.pos = new_pos;
		this.coord = new_coord;
		return [this, current_coord, new_coord, captured_piece];
	}

	hover() {
		this.pos[0] = mouseX - PIECE_SIZE/2;
		this.pos[1] = mouseY - PIECE_SIZE/2;
	}

	attempt_move(){
		let current_coord = this.coord;
		let attemped_pos = this.get_center();
		let attemped_coord = board.pos_to_coord(attemped_pos);
		let legal_moves = this.get_legal_moves();
		legal_moves = this.check_moves_validity(legal_moves);
		if (board.coord_in_list(attemped_coord, legal_moves)){
			let moved = this.move(attemped_coord);
			if (moved[0]){
				if (this instanceof Pawn || this instanceof King || this instanceof Rook){
					this.first_move = false
				}
				return moved;
			}
		}
		this.deny_move(current_coord);
		return null;
	}

	deny_move(previous_coord){
		let bounds = board.coord_to_pos(previous_coord)[1];
		this.pos = bounds.map(x=>x+PIECE_OFFSET);
		this.coord = previous_coord;
	}

	kill_piece(piece, player_pieces){
		let piece_i = player_pieces.indexOf(piece);
			if (piece_i > -1) {
				player_pieces.splice(piece_i, 1);
			}
	}

	handle_capture(current_coord, attemped_coord){
		let enemy_pieces;
		if (player.color == "W") {
			enemy_pieces = black_pieces;
		}
		else{
			enemy_pieces = white_pieces;
		}

		let captured_piece = board.get_piece_on_coord(attemped_coord);
		if (captured_piece && (captured_piece.color !== this.color)){
			board.remove_piece_on_coord(attemped_coord);
			this.kill_piece(captured_piece, enemy_pieces);
		}
		//  handle en passant for pawns, if the new coord is a diagonal move, without
		//  landing on a square where a piece is present
		else if (!captured_piece && (this instanceof Pawn)){
			// This means the pawn made a diagonal move
			if (Math.abs(current_coord[0] - attemped_coord[0]) > 0){
				let enemy_pawn_direction;
				if (this.color == "W"){
					enemy_pawn_direction = [0, -1];
				}
				else{
					enemy_pawn_direction = [0, 1];
				}
				let captured_piece_coord = board.coord_addition(attemped_coord, enemy_pawn_direction);
				let captured_piece = board.get_piece_on_coord(captured_piece_coord);
				this.kill_piece(captured_piece, enemy_pieces);
			}
		}

		return captured_piece;
	}

	check_moves_validity(moves){
		// Checks if a hypothtical move can be made. I.e if
		// after making the move you don't put yourthis in check
		let valid_moves = [];
		for (let i=0;i<moves.length;i++){
			let move = moves[i];
			let removed_piece1 = board.remove_piece_on_coord(this.coord);
			let removed_piece2 = board.remove_piece_on_coord(move);
			board.set_piece_on_coord(this, move);
			let check = board.check_for_checks();
			if (! check){
				valid_moves.push(move);
			}
			// reset board, because these are ! official moves
			board.remove_piece_on_coord(move);
			board.set_piece_on_coord(removed_piece1, this.coord);
			board.set_piece_on_coord(removed_piece2, move);
		}
		return valid_moves
	}

	handle_castling(attemped_coord){
		// Also move the rook, when the king castles
		if (!(this instanceof King)){return;}

		let current_coord = this.coord;
		let step_size = attemped_coord[0] - current_coord[0];
		// break when king move was not a castling move
		if (! (Math.abs(step_size) == 2)){return;}
		let new_coord;
		let rook;
		if (step_size == 2){
			if (this.color === "W"){
				rook = board.get_piece_on_coord([8, 1]);
				new_coord = [6, 1];
			}
			else{
				rook = board.get_piece_on_coord([8, 8]);
				new_coord = [6, 8];
			}
		}
		else if (step_size === -2){
			if (this.color === "W"){
				rook = board.get_piece_on_coord([1, 1]);
				new_coord = [4, 1];
			}
			else{
				rook = board.get_piece_on_coord([1, 8]);
				new_coord = [4, 8];
			}
		}
		if (rook && new_coord){
			rook.move(new_coord);
		}
	}
}

class Pawn extends Piece {
	constructor(pos, coord, color){
		super(pos, coord, color);
		this.img = loadImage(`Assets/${this.color.toLowerCase()}_pawn.png`);
		this.first_move = true;
	}

	get_legal_moves(){
		let current_coord = this.coord;
		let legal_moves = [];
		let direction;
		if (this.color == "W"){
			direction = 1;
		}
		else if (this.color == "B"){
			direction = -1;
		}
		let possible_moves = [[0, direction], [1, direction], [-1, direction]];
		if (this.first_move){
			possible_moves.push([0, 2*direction]);
		}

		for (let i=0;i<possible_moves.length;i++){
			let possible_move = possible_moves[i];
			let new_coord = board.coord_addition(current_coord, possible_move);
			// See if the new coordinate is a valid chess coordinate
			if (new_coord){
				// Only append the diagonal moves if there is an enemy there
				let other_piece = board.get_piece_on_coord(new_coord);
				if (other_piece && (possible_move.toString() !== [0, direction].toString()) && (other_piece.color != this.color)){
					legal_moves.push(new_coord);
				}
				else if (possible_move.toString() === [0, direction].toString() || possible_move.toString() === [0, 2*direction].toString()){
					if (! other_piece){
						legal_moves.push(new_coord);
					}
				}
			}
		}
		// add en passant functionality
		let en_passant_coord = this.check_en_passant();
		if (en_passant_coord){
			legal_moves.push(en_passant_coord);
		}
		
		return legal_moves
	}

	check_en_passant(){
		if (! last_move){ return null;}
		let [last_moved_piece, previous_coord, new_coord, _] = last_move;
		let current_coord = this.coord;
		let left_coord = board.coord_addition(current_coord, [-1, 0]);
		let right_coord = board.coord_addition(current_coord, [1, 0]);
		if (!(left_coord && right_coord)){return null};
		if ((last_moved_piece instanceof Pawn) && last_moved_piece.color != this.color){
			let step_size = abs(previous_coord[1] - new_coord[1]);
			if (step_size == 2 && (board.coord_comparison(new_coord, left_coord) || board.coord_comparison(new_coord, right_coord))){
				let legal_capture_coord;
				if (this.color == "W"){
					legal_capture_coord = board.coord_addition(new_coord, [0, 1]);
				}
				else{
					legal_capture_coord = board.coord_addition(new_coord, [0, -1]);
				}
				return legal_capture_coord;
			}
		}
		return null;
	}
}

class Rook extends Piece {
	constructor(pos, coord, color){
		super(pos, coord, color);
		this.img = loadImage(`Assets/${this.color.toLowerCase()}_rook.png`);
		this.first_move = true;
	}
	get_legal_moves(){
		let current_coord = this.coord;
		let legal_moves = [];
		let directions = [[0, 1], [1, 0], [-1, 0], [0, -1]];

		for (let i=0;i<directions.length;i++){
			let enemy_pieces_encountered = 0;
			let direction = directions[i];
			// Max moves are 7, ! 8
			for (let j=1;j<=8;j++){
				let addition_coord = direction.map(x=>x*j);
				if (enemy_pieces_encountered != 0){ break;}
				let new_coord = board.coord_addition(current_coord, addition_coord);
				if (!new_coord){ break;}
				let piece_on_new_coord = board.get_piece_on_coord(new_coord);
				if (! piece_on_new_coord){
					legal_moves.push(new_coord);
				}
				else if (piece_on_new_coord.color != this.color){
					legal_moves.push(new_coord);
					enemy_pieces_encountered += 1;
				}
				else{
					break;
				}

			}
		}
		return legal_moves
	}
}

class Knight extends Piece {
	constructor(pos, coord, color){
		super(pos, coord, color);
		this.img = loadImage(`Assets/${this.color.toLowerCase()}_knight.png`);
	}

	get_legal_moves(){
		let current_coord = this.coord;
		let legal_moves = [];
		let possible_moves = [[2, 1], [-2, 1], [-1, 2], [1, 2],
						  	  [-2, -1], [2, -1], [1, -2], [-1, -2]];

		for (let i=0;i<possible_moves.length;i++){
			let possible_move = possible_moves[i];
			let new_coord = board.coord_addition(current_coord, possible_move);
			if (!new_coord){ continue;}
			let piece_on_new_coord = board.get_piece_on_coord(new_coord);
			if (! piece_on_new_coord){
				legal_moves.push(new_coord);
			}
			else if (piece_on_new_coord.color != this.color){
				legal_moves.push(new_coord);
			}
		}
		return legal_moves;
	}
}

class Bishop extends Piece {
	constructor(pos, coord, color){
		super(pos, coord, color);
		this.img = loadImage(`Assets/${this.color.toLowerCase()}_bishop.png`);
	}

	get_legal_moves(){
		let current_coord = this.coord;
		let legal_moves = [];
		let directions = [[1, 1], [1, -1], [-1, -1], [-1, 1]];

		for (let i=0;i<directions.length;i++){
			let enemy_pieces_encountered = 0;
			let direction = directions[i];
			// Max moves are 7, ! 8
			for (let j=1;j<=8;j++){
				let addition_coord = direction.map(x=>x*j);
				if (enemy_pieces_encountered != 0){ break;}
				let new_coord = board.coord_addition(current_coord, addition_coord);
				if (!new_coord){ break;}
				let piece_on_new_coord = board.get_piece_on_coord(new_coord);
				if (! piece_on_new_coord){
					legal_moves.push(new_coord);
				}
				else if (piece_on_new_coord.color != this.color){
					legal_moves.push(new_coord);
					enemy_pieces_encountered += 1;
				}
				else{
					break;
				}

			}
		}
		return legal_moves
	}
}

class Queen extends Piece {
	constructor(pos, coord, color){
		super(pos, coord, color);
		this.img = loadImage(`Assets/${this.color.toLowerCase()}_queen.png`);
	}
	get_legal_moves(){
		let current_coord = this.coord;
		let legal_moves = [];
		let directions = [[0, 1], [1, 0], [-1, 0], [0, -1], 
						 [1, 1], [1, -1], [-1, -1], [-1, 1]];

		for (let i=0;i<directions.length;i++){
			let enemy_pieces_encountered = 0;
			let direction = directions[i];
			// Max moves are 7, ! 8
			for (let j=1;j<=8;j++){
				let addition_coord = direction.map(x=>x*j);
				if (enemy_pieces_encountered != 0){ break;}
				let new_coord = board.coord_addition(current_coord, addition_coord);
				if (!new_coord){ break;}
				let piece_on_new_coord = board.get_piece_on_coord(new_coord);
				if (! piece_on_new_coord){
					legal_moves.push(new_coord);
				}
				else if (piece_on_new_coord.color != this.color){
					legal_moves.push(new_coord);
					enemy_pieces_encountered += 1
				}
				else{
					break;
				}

			}
		}
		return legal_moves
	}

}

class King extends Piece {
	constructor(pos, coord, color){
		super(pos, coord, color);
		this.img = loadImage(`Assets/${this.color.toLowerCase()}_king.png`);
		this.first_move = true;
	}

	get_legal_moves(){
		let current_coord = this.coord;
		let legal_moves = [];
		let possible_moves = [[1, 1], [-1, 1], [-1, -1], [1, -1],
						  	  [0, 1], [0, -1], [1, 0], [-1, 0]];

		for (let i=0;i<possible_moves.length;i++){
			let possible_move = possible_moves[i];
			let new_coord = board.coord_addition(current_coord, possible_move);
			if (!new_coord){ continue;}
			let piece_on_new_coord = board.get_piece_on_coord(new_coord);
			if (! piece_on_new_coord){
				legal_moves.push(new_coord);
			}
			else if (piece_on_new_coord.color != this.color){
				legal_moves.push(new_coord);
			}
		}
		let castling_moves = this.check_castling();
		if (castling_moves){
			for(let i=0;i<castling_moves.length;i++){
				let move = castling_moves[i];
				legal_moves.push(move);
			}
		}
		return legal_moves;
	}


	check_castling(){
		// stop when already moved
		if (!this.first_move){ return [];}
		let current_coord = this.coord;
		let directions = [[1, 0], [-1, 0]];

		let legal_moves = [];
		for (let i=0;i<directions.length;i++){
			let direction = directions[i];
			for (let j=1;j<=6;j++){
				let possible_move = direction.map(x=>x*j);
				let new_coord = board.coord_addition(current_coord, possible_move);
				if (! new_coord){ break; }
				let piece_on_new_coord = board.get_piece_on_coord(new_coord);
				if ((piece_on_new_coord) && !(piece_on_new_coord instanceof Rook)){
					break;
				}
				// If an empty square put the king in check, you cant castle
				if (!piece_on_new_coord){
					if (this.attacked_square(new_coord)){
						break;
					}
				}
				// only add castling right if the piece on the edge of the board found
				// is your own rook that has not moved
				else if (piece_on_new_coord instanceof Rook){
					if (piece_on_new_coord.color === this.color && piece_on_new_coord.first_move){
						let king_coord;
						if (i === 0){
							king_coord = board.coord_addition(current_coord, [2, 0]);
						}
						else{
							king_coord = board.coord_addition(current_coord, [-2, 0]);
						}
						legal_moves.push(king_coord);
					}
				}
			}
		}
		return legal_moves
	}

	attacked_square(square){
		let enemy_pieces;
		if (this.color === "W"){
			enemy_pieces = black_pieces;
		}
		else{
			enemy_pieces = white_pieces;
		}

		for (let i=0;i<enemy_pieces.length;i++){
			let piece = enemy_pieces[i];
			// Handle an edge case with the king, which causes innite recursion
			// if not handled this way, ugly I know
			if (piece instanceof King && piece.color !== this.color){
				let enemy_king_coord = piece.coord;
				let illegal_coords;
				if (this.color === "W"){
					illegal_coords = [[2, 2], [3, 2], [7, 2]];
				}
				else if (this.color === "B"){
					illegal_coords = [[2, 7], [3, 7], [7, 7]];
				}
				if(board.coord_in_list(enemy_king_coord, illegal_coords)){
					return true;
				}
			}
			else{
				let enemy_moves = piece.get_legal_moves();
				if (board.coord_in_list(square, enemy_moves)){
					return true;
				}
			}
		}
		return false
	}
}

