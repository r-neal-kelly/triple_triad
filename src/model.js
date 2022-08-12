/* Contains all the tiers and all their collectible cards. */
class Pack
{
    #tiers;

    constructor(pack_json)
    {

    }
}

/* Contains all the collectible cards in a single tier of a pack. */
class Tier
{
    #cards;

    constructor(cards_from_json)
    {

    }
}

/* Contains the stats for each individual card in a pack. */
class Card
{
    #left;
    #top;
    #right;
    #bottom;

    #picture;

    constructor(left, top, right, bottom, picture)
    {
        this.#left = left;
        this.#top = top;
        this.#right = right;
        this.#bottom = bottom;

        this.#picture = picture;
    }

    Left()
    {
        return this.#left;
    }

    Top()
    {
        return this.#top;
    }

    Right()
    {
        return this.#right;
    }

    Bottom()
    {
        return this.#bottom;
    }

    Picture()
    {
        return this.#picture;
    }
}

/* Contains a number of card counts and a tier range to generate stakes. */
class Collection
{
    #pack;
    #card_counts;

    #min_tier_index;
    #max_tier_index;

    constructor()
    {
        // should be able to keep an array of cards in the collection
        // and a min-max from which to randomly select cards from its pack.
        // if there aren't enough cards in the array, the remainder can be
        // randomly selected from the pack's tiers.
    }
}

/* Contains a particular card and a count thereof. */
class Card_Count
{
    #card;
    #count;

    constructor(card, count)
    {
        this.#card = card;
        this.#count = count;
    }

    Increment()
    {

    }

    Decrement()
    {

    }

    Add(count)
    {

    }

    Subtract(count)
    {

    }
}

/* An instance of a game including a board, its players, and their stakes. */
export default class Arena
{
    #rules;
    #board;
    #players;

    constructor(rule_flags, board_row_count, board_column_count, player_count)
    {
        if (player_count < 2) {
            throw new Error(`Must have at least 2 players.`);
        } else {
            this.#rules = new Rules(rule_flags);
            this.#board = new Board(this, board_row_count, board_column_count);
            if (player_count > this.#board.Cell_Count()) {
                throw new Error(`The board is too small for ${player_count} player(s).`);
            } else {
                const max_stake_count = Math.ceil(this.#board.Cell_Count() / player_count);
                this.#players = Array(player_count).fill(new Player(this, max_stake_count));
            }
        }
    }

    Rules()
    {
        return this.#rules;
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

/* A selection of rules which an arena must abide by. */
class Rules
{
    constructor(rule_flags)
    {

    }
}

/* Contains stakes actively in play. */
class Board
{
    #arena;

    #row_count;
    #column_count;
    #cell_count;

    #stake_count;
    #stakes;

    constructor(arena, row_count, column_count)
    {
        this.#arena = arena;

        this.#row_count = row_count;
        this.#column_count = column_count;
        this.#cell_count = this.#row_count * this.#column_count;

        this.#stake_count = 0;
        this.#stakes = Array(this.#cell_count).fill(null);
    }

    Arena()
    {
        return this.#arena;
    }

    Row_Count()
    {
        return this.#row_count;
    }

    Column_Count()
    {
        return this.#column_count;
    }

    Cell_Count()
    {
        return this.#cell_count;
    }

    Stake_Count()
    {
        return this.#stake_count;
    }

    Stake(row, column)
    {
        if (row < this.Row_Count() && column < this.Column_Count()) {
            return this.#stakes[row * column + column];
        } else {
            throw new Error("Invalid stake coordinates.");
        }
    }

    Place_Stake(player_index, stake_index)
    {
        // calls Evaluate_Stake after adding the stake.
    }

    #Evaluate_Stake(row, column)
    {
        // this should update adjacents cards by evaluating the rules,
        // as if a card was just placed in this position.
        // however, it will be used recursively for cards that have already
        // been placed to detect if a combo should occur.
    }
}

/* Contains stakes selected for a player. */
class Player
{
    #arena;

    #collection; // how to provide this for the player, and generate it for ai?
    #stakes;

    constructor(arena, max_stake_count)
    {
        this.#arena = arena;

        this.#stakes = Array(max_stake_count).fill(this, new Stake(new Card(1, 1, 1, 1, null)));
    }

    Arena()
    {
        return this.#arena;
    }

    Stake_Count()
    {
        return this.#stakes.length;
    }

    Stake(index)
    {
        if (index < this.Stake_Count()) {
            return this.#stakes[index];
        } else {
            throw new Error("Invalid stake index.");
        }
    }

    Has_Stake(stake)
    {
        return this.#stakes.contains(stake);
    }

    Remove_Stake(index)
    {
        const stake = Stake(index);
        if (stake == null) {
            throw new Error("Cannot remove a null stake.");
        } else {
            this.#stakes[index] = null;

            return stake;
        }
    }
}

/* Contains a card at either in a player's hand or on the board, as well as its current owner. */
class Stake
{
    #player;
    #card;

    constructor(player, card)
    {
        this.#player = player;
        this.#card = card;
    }

    Player()
    {
        return this.#player;
    }

    Card()
    {
        return this.#card;
    }

    Is_In_Hand()
    {
        return this.#player.Has_Stake(this);
    }

    Is_On_Board()
    {
        return !this.Is_In_Hand();
    }
}
