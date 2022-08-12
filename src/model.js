export default class Model
{
    #board;
    #players;

    constructor(player_count, board_row_count, board_column_count)
    {
        if (player_count < 2) {
            throw new Error(`Must have at least 2 players.`);
        } else {
            this.#board = new Board(board_row_count, board_column_count);

            if (player_count > this.#board.Tile_Count()) {
                throw new Error(`The board is too small for ${player_count} player(s).`);
            } else {
                const hand_card_count = Math.ceil(this.#board.Tile_Count() / player_count);
                this.#players = Array(player_count).fill(new Player(hand_card_count));
            }
        }
    }

    Board()
    {
        return this.#board;
    }

    Player_Count()
    {
        return this.#players.length;
    }

    Player(index)
    {
        if (index < this.Player_Count()) {
            return this.#players[index];
        } else {
            throw new Error("Invalid player index.");
        }
    }
};

class Board
{
    #row_count;
    #column_count;
    #tile_count;

    #card_count;
    #cards;

    constructor(row_count, column_count)
    {
        this.#row_count = row_count;
        this.#column_count = column_count;
        this.#tile_count = this.#row_count * this.#column_count;

        this.#card_count = 0;
        this.#cards = Array(this.#tile_count).fill(null);
    }

    Row_Count()
    {
        return this.#row_count;
    }

    Column_Count()
    {
        return this.#column_count;
    }

    Tile_Count()
    {
        return this.#tile_count;
    }

    Card_Count()
    {
        return this.#card_count;
    }

    Card(row, column)
    {
        if (row < this.Row_Count() && column < this.Column_Count()) {
            return this.#cards[row * column + column];
        } else {
            throw new Error("Invalid card coordinates.");
        }
        return null;
    }

    Place_Card(player, hand_card_index)
    {

    }
}

class Player
{
    #board_card_count;
    #hand;

    constructor(hand_card_count)
    {
        this.#board_card_count = 0;
        this.#hand = new Hand(this, hand_card_count);
    }

    Board_Card_Count()
    {
        return this.#board_card_count;
    }

    Hand()
    {
        return this.#hand;
    }
}

class Hand
{
    #player;
    #cards;

    constructor(player, card_count)
    {
        this.#player = player;
        this.#cards = Array(card_count).fill(new Card(this.#player));
    }

    Player()
    {
        return this.#player;
    }

    Card_Count()
    {
        return this.#cards.length;
    }

    Card(index)
    {
        if (index < this.Card_Count()) {
            return this.#cards[index];
        } else {
            throw new Error("Invalid card index.");
        }
    }
}

class Card
{
    #player;

    constructor(player)
    {
        this.#player = player;
    }

    Player()
    {
        return this.#player;
    }
}
