import final_fantasy_8_pack_from_json from "./pack/final_fantasy_8.json"

/* Contains all available packs. */
export class Packs
{
    #pack_count;
    #packs;

    constructor()
    {
        const packs_from_json = [
            final_fantasy_8_pack_from_json,
        ];

        this.#pack_count = packs_from_json.length;
        this.#packs = {};

        packs_from_json.forEach((pack_from_json) =>
        {
            if (this.#packs[pack_from_json.name] != null) {
                throw new Error(`Pack with the name "${pack_from_json.name}" already exists.`);
            } else {
                this.#packs[pack_from_json.name] = new Pack(this, pack_from_json);
            }
        });
    }

    Pack_Count()
    {
        return this.#pack_count;
    }

    Pack(name)
    {
        const pack = this.#packs[name];

        if (pack == null) {
            throw new Error("Invalid pack name.");
        } else {
            return pack;
        }
    }

    Random_Pack()
    {
        return this.Array()[Math.floor(Math.random() * this.Pack_Count())];
    }

    Array()
    {
        return this.#packs.values();
    }
}

/* Contains all the tiers and all their collectible cards. */
class Pack
{
    #packs;
    #name;
    #tiers;

    constructor(packs, pack_from_json)
    {
        this.#packs = packs;
        this.#name = pack_from_json.name;
        this.#tiers = pack_from_json.data.map((tier_from_json) =>
        {
            return new Tier(this, tier_from_json);
        });
    }

    Packs()
    {
        return this.#packs;
    }

    Name()
    {
        return this.#name;
    }

    Tier_Count()
    {
        return this.#tiers.length;
    }

    Tier(index)
    {
        if (index < this.Tier_Count()) {
            return this.#tiers[index];
        } else {
            throw new Error("Invalid tier index.");
        }
    }
}

/* Contains all the collectible cards in a single tier of a pack. */
class Tier
{
    #pack;
    #cards;

    constructor(pack, tier_from_json)
    {
        this.#pack = pack;
        this.#cards = tier_from_json.map((card_from_json) =>
        {
            return new Card(this, card_from_json);
        });
    }

    Pack()
    {
        return this.#pack;
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

/* Contains the data for each individual card in a pack. */
class Card
{
    #tier;
    #data;

    constructor(tier, card_from_json)
    {
        this.#tier = tier;
        this.#data = card_from_json;
    }

    Pack()
    {
        return this.#tier.Pack();
    }

    Tier()
    {
        return this.#tier;
    }

    Name()
    {
        return this.#data.name;
    }

    Image()
    {
        return this.#data.image;
    }

    Element()
    {
        return this.#data.element;
    }

    Left()
    {
        return this.#data.left;
    }

    Top()
    {
        return this.#data.top;
    }

    Right()
    {
        return this.#data.right;
    }

    Bottom()
    {
        return this.#data.bottom;
    }
}

/* Contains a number of card counts and a tier range to generate stakes. */
class Collection
{
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
        if (count < 0) {
            throw new Error(`Count must be greater than or equal to 0.`)
        } else {
            this.#card = card;
            this.#count = count;
        }
    }

    Card()
    {
        return this.#card;
    }

    Count()
    {
        return this.#count;
    }

    Add(count)
    {
        if (this.#count + count < this.#count) {
            throw new Error(`Cannot add ${count} to the count.`);
        } else {
            this.#count += count;
        }
    }

    Subtract(count)
    {
        if (this.#count - count > this.#count) {
            throw new Error(`Cannot subtract ${count} from the count.`);
        } else {
            this.#count -= count;
        }
    }

    Increment()
    {
        this.Add(1);
    }

    Decrement()
    {
        this.Subtract(1);
    }
}

/* An instance of a game including a board, its players, and their stakes. */
export class Arena
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

        // maybe we should have this on the player type as well, because we'll have to track which stake is selected.
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

/* Contains a card either on a player or on the board, and its current claimant. */
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

    Is_On_Player()
    {
        return this.#player.Has_Stake(this);
    }

    Is_On_Board()
    {
        return !this.Is_In_Hand();
    }
}
