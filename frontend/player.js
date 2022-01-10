class Player {
	constructor (color, id, pieces, time){
		this.color = color;
		this.id = id
		this.picked_up_piece = null;
		this.selected_piece = null;
		this.pieces = pieces;
		this.captured_pieces = {"Q":0, "N":0, "R":0, "B":0, "P":0};
		this.time = time;
		this.no_legal_moves = false;
		this.in_check = false;
		this.data = {"color":color, "id":id}
	}

	getData(){ return this.data};

	pick_up_piece(piece) {
		this.picked_up_piece = piece;
	}

	select_piece(piece) {
		this.selected_piece = piece;
	}

	check_for_legal_moves(){
		let total_pieces = 0;
		let unmoveable = 0;
		for (let i=0;i<this.pieces.length;i++){
			let piece = this.pieces[i];
			if (!piece) {continue;}
			let moves = piece.get_legal_moves();
			moves = piece.check_moves_validity(moves);
			if (moves.length === 0){
				unmoveable += 1;
			}
			total_pieces += 1;
		}
		if (unmoveable === total_pieces){
			return false;
		}
		return true;
	}
}
