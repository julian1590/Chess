function setup() {
	game = new Game();
	board = new Board();
	// Last move done, (Piece, prev_sq, next_sq, captured_piece)
	last_move = [null, null, null, null];
	current_legal_moves = [];
	// one move is both players doing a move
	moves_done = 0;
	moves_without_capture = 0;
	moves_without_pawn_move = 0;
	// Create canvas in the canvas div 
	let canvas = createCanvas(SCREEN_SIZE, SCREEN_SIZE);
	canvas.parent("game");
}

function draw() {
	if (player){
		background(BKG_COLOR);
		board.display();	
		color_last_move();
		// Move piece if the current player selected one
		if (player.selected_piece || player.picked_up_piece) {
			color_selected_square();
			color_legal_moves();
			if(mouseIsPressed){
				player.pick_up_piece(player.selected_piece);
				player.selected_piece.hover();
			}
		}

		for (let i=0;i<white_pieces.length;i++){
			let piece = white_pieces[i];
			piece.display();
		};

		for (let i=0;i<black_pieces.length;i++){
			let piece = black_pieces[i];
			piece.display();
		};
	}
}


function color_selected_square(){
	let piece_coord = player.selected_piece.coord;
	let [left, top] = board.coord_to_pos(piece_coord)[1];
	fill("yellow")
	noStroke();
	rect(left, top, SQR_SIZE, SQR_SIZE);

}

function color_last_move(){	
	if (last_move[0]) {
		let [, old_sq, new_sq,] = last_move;
		let [left, top] = board.coord_to_pos(new_sq)[1];
		let [left2, top2] = board.coord_to_pos(old_sq)[1];
		fill(255, 255, 0, 200);
		noStroke();
		rect(left, top, SQR_SIZE, SQR_SIZE);
		rect(left2, top2, SQR_SIZE, SQR_SIZE);
	}
}

function color_legal_moves(){	
	for (let i=0;i<current_legal_moves.length;i++){
		let coord = current_legal_moves[i];
		let [center_x, center_y] = board.coord_to_pos(coord)[0];
		let enemy_piece = board.get_piece_on_coord(coord);
		if (enemy_piece && enemy_piece.color !== player.color){
			noFill()
			stroke((128, 128, 128, 200));
			strokeWeight(4);
			circle(center_x, center_y, SQR_SIZE-4);
		} else{
			noStroke();
			fill("green");
			circle(center_x, center_y, SQR_SIZE/10);
		}
	}
}


function mousePressed(){
	if (player){
		if (player.color === my_color){
			let coord = board.pos_to_coord([mouseX, mouseY]);
			if (coord){
				let piece = board.get_piece_on_coord(coord);
				if (piece && (player.color === piece.color)){
					player.select_piece(piece);
					current_legal_moves = player.selected_piece.get_legal_moves()
				}
				else {
					player.select_piece(null);
					current_legal_moves = [];
				}
			}
		}
	}
}

function mouseReleased(){
	if (player) {
		if (player.color === my_color){
			let piece = player.picked_up_piece;
			if (piece) {
				let moved = piece.attempt_move();
				if (moved){
					// set last move to the move done
					last_move = moved;
					player.picked_up_piece = null;
					player.selected_piece = null;
					game.next_player();
					// Send the move to the server, so other player can update
					let msg = {from:moved[1], to:moved[2]};
					socket.emit("move", msg);
				}
				else{
					player.picked_up_piece = null;
				}
			}
		}
	}
}


function init_pieces(color){
	// Initialize all pieces and setthe current and previous board matrices
	let color_pieces = []
	let pawn_coords = [];
	if (color === "W") {
		for (let i = 0; i < board.x_axis.length; i++) {
			var x = board.x_axis[i]
			pawn_coords.push([x, 2]);
		};
	}
	else if (color === "B") {
		for (let i = 0; i < board.x_axis.length; i++) {
			var x = board.x_axis[i]
			pawn_coords.push([x, 7]);
		};
	}
	// Add pawns
	for (let i=0; i<pawn_coords.length; i++){
		// get left top coordinate of the square (board is how pygame places rects)
		var coord = pawn_coords[i];
		let pixel_pos = board.coord_to_pos(coord)[1];
		let top_left = pixel_pos.map(x => x + PIECE_OFFSET);
		let pawn = new Pawn(top_left, coord, color);
		color_pieces.push(pawn)
		board.set_piece_on_coord(pawn, coord)
		board.set_piece_on_coord(pawn, coord, board.previous_board)
	};

	// # order of pieces on the bank rank
	let backrank_order = [Rook, Knight, Bishop, Queen, King, Bishop, 
					  	  Knight, Rook];
	let rank_i = 8;
	if (color === "W"){
		rank_i = 1;
	}
	for (let i=0; i<backrank_order.length; i++){
		coord = [board.x_axis[i], rank_i];
		let pixel_pos = board.coord_to_pos(coord)[1];
		let top_left = pixel_pos.map(x => x + PIECE_OFFSET);
		let piece = new backrank_order[i](top_left, coord, color);
		color_pieces.push(piece);
		board.set_piece_on_coord(piece, coord)
		board.set_piece_on_coord(piece, coord, board.previous_board)
	};
	return color_pieces;
}
