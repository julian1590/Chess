// Some global varibales
let board, game, white_player, black_player;
let white_pieces;
let black_pieces;
let players = [null, null];
let player_i = 0;
let player = null;
let last_move;
let current_legal_moves;
let moves_done;
let moves_without_capture;
let moves_without_pawn_move;

// dimension vars
const BKG_COLOR = (180, 180, 180);
const BEZEL_SIZE = 80;
const BOARD_ORIGIN = [BEZEL_SIZE, BEZEL_SIZE]; // top left origin of board
const BOARD_SIZE = 560;
const SCREEN_SIZE = BOARD_SIZE + 2*BEZEL_SIZE;
const SQR_SIZE = Math.floor(BOARD_SIZE/8); // Size of a single square
const PIECE_OFFSET = 10;
const PIECE_SIZE = SQR_SIZE-2*PIECE_OFFSET;