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

    Packs()
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
        if (pack_from_json.data.length < 1) {
            throw new Error(`The pack ${pack_from_json.name} must have at least one tier.`);
        } else {
            this.#packs = packs;
            this.#name = pack_from_json.name;
            this.#tiers = pack_from_json.data.map((tier_from_json) =>
            {
                return new Tier(this, tier_from_json);
            });
        }
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

    Tiers()
    {
        return Array.from(this.#tiers);
    }
}

/* Contains all the collectible cards in a single tier of a pack. */
class Tier
{
    #pack;
    #cards;

    constructor(pack, tier_from_json)
    {
        if (tier_from_json.length < 1) {
            throw new Error(`Each tier must have at least one card.`);
        } else {
            this.#pack = pack;
            this.#cards = tier_from_json.map((card_from_json) =>
            {
                return new Card(this, card_from_json);
            });
        }
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

    Cards()
    {
        return Array.from(this.#cards);
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

/* Contains a number of cards held by a player and several shuffles from which to generate cards. */
export class Collection
{
    #card_counts;
    #shuffles;

    constructor()
    {
        // if there aren't enough cards in the card_count array, the remainder can be
        // randomly selected from the shuffles. card_counts can have cards from any pack.

        this.#card_counts = [];
        this.#shuffles = [];

        // perhaps by default we should add a shuffle for the default pack with just a tier range of 0 to 0.
        // else we should require shuffles to be passed in. we could also have a extension of this class
        // just for the player.
    }

    Cards(count)
    {
        return [];
    }

    Serialize()
    {
        return {};
    }

    Deserialize(data)
    {

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

/* Provides a fine-tuned way to randomly generate a list of cards from an individual pack. */
class Shuffle
{
    #pack;
    #min_tier_index;
    #max_tier_index;

    constructor(pack, min_tier_index, max_tier_index)
    {
        if (min_tier_index > max_tier_index) {
            throw new Error(`The min_tier_index is greater than the max_tier_index: ${min_tier_index} > ${max_tier_index}`);
        } else if (max_tier_index >= pack.Tier_Count()) {
            throw new Error(`The max_tier_index indicates a non-existant tier in the pack "${pack.Name()}"`);
        } else {
            this.#pack = pack;
            this.#min_tier_index = min_tier_index;
            this.#max_tier_index = max_tier_index;
        }
    }

    Pack()
    {
        return this.#pack;
    }

    Min_Tier_Index()
    {
        return this.#min_tier_index;
    }

    Max_Tier_Index()
    {
        return this.#max_tier_index;
    }

    Cards(count)
    {
        // It's guaranteed that at least one card exists in every tier, and that every pack has at least one tier.

        const tier_count = this.#max_tier_index + 1 - this.#min_tier_index;

        const results = [];
        for (let idx = 0, end = count; idx < end; idx += 1) {
            const tier_index = Math.floor(Math.random() * tier_count) + this.#min_tier_index;
            const tier = this.#pack.Tier(tier_index);
            results.push(tier.Card(Math.floor(Math.random() * tier.Card_Count())));
        }

        return results;
    }

    Unique_Cards(count)
    {
        const cards = [];
        for (let idx = this.#min_tier_index, end = this.#max_tier_index + 1; idx < end; idx += 1) {
            cards.push(...this.#pack.Tier(idx).Cards());
        }

        if (count > cards.length) {
            throw new Error(`The count exceeds the number of available unique cards.`);
        } else {
            const results = [];
            for (let idx = 0, end = count; idx < end; idx += 1) {
                const card_index = Math.floor(Math.random() * cards.length);
                results.push_back(cards[card_index]);
                cards[card_index] = cards[cards.length - 1];
                cards.pop();
            }

            return results;
        }
    }
}

/* An instance of a game including a board, its players, and their stakes. */
export class Arena
{
    #rules;
    #board;
    #players;

    // instead of a player_count, we should just pass an array of collections.
    // in order to let the player choose which cards to use, we'll need to probably
    // have a method on this before the game begins proper.
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
                const stake_count = Math.ceil(this.#board.Cell_Count() / player_count);
                this.#players = Array(player_count).fill(new Player(this, null, stake_count));
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
    #collection;
    #stakes;

    constructor(arena, collection, stake_count)
    {
        this.#arena = arena;
        this.#collection = collection;
        this.#stakes = Array(stake_count).fill(this, new Stake(this, null)); // we need to generate the cards from the collection.
    }

    Arena()
    {
        return this.#arena;
    }

    Collection()
    {
        return this.#collection;
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
        return !this.Is_On_Player();
    }
}
