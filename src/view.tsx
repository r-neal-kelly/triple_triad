import "./view.css";

import React from "react";

import { Integer, Assert, Wait } from "./utils";
import * as Event from "./event";
import * as Model from "./model";
import { Component, Component_Styles } from "./view/component";

const PLAYER_STAKE_HEIGHT_MULTIPLIER: number = 0.48;
const PLAYER_ALPHA_HIGHLIGHT_MULTIPLIER: number = 0.7;
const AI_SELECTION_WAIT_MILLISECONDS: number = 667;
const TURN_RESULT_WAIT_MILLISECONDS: number = 667;
const TURN_RESULT_TRANSITION_RATIO: number = 1 / 2;

const BEFORE: Event.Name_Prefix = Event.BEFORE;
const ON: Event.Name_Prefix = Event.ON;
const AFTER: Event.Name_Prefix = Event.AFTER;

const START_EXHIBITIONS: Event.Name_Affix = `Start_Exhibitions`;
const STOP_EXHIBITIONS: Event.Name_Affix = `Stop_Exhibitions`;
const SWITCH_EXHIBITION: Event.Name_Affix = `Switch_Exhibition`;
const START_NEW_GAME: Event.Name_Affix = `Start_New_Game`;
const OPEN_TOP_MENU: Event.Name_Affix = `Open_Top_Menu`;
const OPEN_OPTIONS_MENU: Event.Name_Affix = `Open_Options_Menu`;
const GAME_START: Event.Name_Affix = `Game_Start`;
const GAME_STOP: Event.Name_Affix = `Game_Stop`;
const PLAYER_START_TURN: Event.Name_Affix = `Player_Start_Turn`;
const PLAYER_STOP_TURN: Event.Name_Affix = `Player_Stop_Turn`;
const PLAYER_SELECT_STAKE: Event.Name_Affix = `Player_Select_Stake`;
const PLAYER_PLACE_STAKE: Event.Name_Affix = `Player_Place_Stake`;
const BOARD_CHANGE_CELL: Event.Name_Affix = `Board_Change_Cell`;

// might want to turn these into full classes so that the sender has to fill out the info properly.
// that would mean changing how the event types add the event instance to the data
type Start_New_Game_Data = {
}

type Open_Top_Menu_Data = {
}

type Open_Options_Menu_Data = {
}

type Switch_Exhibition_Data = {
    previous: Model.Exhibition,
    next: Model.Exhibition,
}

type Game_Start_Data = {
}

type Game_Stop_Data = {
    scores: Model.Scores;
}

type Player_Start_Turn_Data = {
    player_index: Model.Player_Index;
}

type Player_Stop_Turn_Data = {
    player_index: Model.Player_Index;
}

type Player_Select_Stake_Data = {
    player_index: Model.Player_Index;
    stake_index: Model.Stake_Index;
}

type Player_Place_Stake_Data = {
    player_index: Model.Player_Index;
    stake_index: Model.Stake_Index;
    cell_index: Model.Cell_Index;
}

type Board_Change_Cell_Data = {
    cell_index: Model.Cell_Index;
    turn_result: Model.Turn_Result;
}

type Main_Props = {
    model: Model.Main;
    parent: HTMLElement;
    event_grid: Event.Grid;
}

export class Main extends Component<Main_Props>
{
    private menu: Menu | null = null;
    private exhibitions: Exhibitions | null = null;
    private arena: Arena | null = null;

    private current_width: Integer = this.Parent().clientWidth;
    private current_height: Integer = this.Parent().clientHeight;
    private resize_observer: ResizeObserver = new ResizeObserver(this.On_Resize.bind(this));

    Menu():
        Menu
    {
        if (this.menu == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.menu;
        }
    }

    Exhibitions():
        Exhibitions
    {
        if (this.exhibitions == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.exhibitions;
        }
    }

    Arena():
        Arena
    {
        if (this.arena == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.arena;
        }
    }

    Width():
        Integer
    {
        return this.current_width;
    }

    Height():
        Integer
    {
        return this.current_height;
    }

    CSS_Width():
        string
    {
        return `${this.Width()}px`;
    }

    CSS_Height():
        string
    {
        return `${this.Height()}px`;
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,

            position: `relative`,

            animationName: `Main_Fade_In`,
            animationDuration: `5000ms`,
            animationTimingFunction: `ease-in-out`,
            animationIterationCount: `1`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        // we create an exhibition match between computers for the background of main
        // and keep doing rematches until the player decides to start up a game of their own

        const model: Model.Main = this.Model();

        if (model.Isnt_In_Game()) {
            return (
                <div
                    className={`Main`}
                    style={this.Styles()}
                >
                    <Menu
                        key={`menu`}
                        ref={ref => this.menu = ref}

                        model={model.Menu()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                    <Exhibitions
                        key={`exhibitions`}
                        ref={ref => this.exhibitions = ref}

                        model={this.Model()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else {
            const arena: Model.Arena = model.Current_Arena() as Model.Arena;

            return (
                <div
                    className={`Main`}
                    style={this.Styles()}
                >
                    <Arena
                        key={`arena`}
                        ref={ref => this.arena = ref}

                        model={arena}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        }
    }

    async On_Resize():
        Promise<void>
    {
        const element: HTMLElement = this.Some_Element();
        const width: Integer = element.clientWidth;
        const height: Integer = element.clientHeight;
        if (this.current_width !== width || this.current_height !== height) {
            this.current_width = width;
            this.current_height = height;
            this.Refresh();
        }
    }

    On_Life():
        Event.Listener_Info[]
    {
        this.resize_observer.observe(this.Some_Element());

        this.While_Alive();

        return [
            {
                event_name: new Event.Name(ON, START_NEW_GAME),
                event_handler: this.On_Start_New_Game,
            },
        ];
    }

    async While_Alive():
        Promise<void>
    {
        while (true) {
            await Wait(5000);
            if (this.Is_Alive()) {
                this.Model().Change_Current_Exhibition();
                await this.Refresh();
            } else {
                return;
            }
        }
    }

    async On_Start_New_Game():
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Main = this.Model();
            const packs: Model.Packs = model.Packs();
            const rules: Model.Rules = model.Menu().Options().Data().Rules();

            model.New_Game([
                new Model.Random_Selection({
                    collection: new Model.Collection({
                        default_shuffle: new Model.Shuffle({
                            pack: packs.Pack(`Cats`),
                            min_tier_index: 0,
                            max_tier_index: 9,
                        }),
                    }),
                    color: new Model.Color({
                        red: 63,
                        green: 63,
                        blue: 127,
                        alpha: 0.7,
                    }),
                    is_of_human: true,
                    card_count: rules.Selection_Card_Count(),
                }),
                new Model.Random_Selection({
                    collection: new Model.Collection({
                        default_shuffle: new Model.Shuffle({
                            pack: packs.Pack(`Cats`),
                            min_tier_index: 0,
                            max_tier_index: 9,
                        }),
                    }),
                    color: new Model.Color({
                        red: 63,
                        green: 127,
                        blue: 63,
                        alpha: 0.7,
                    }),
                    is_of_human: false,
                    card_count: rules.Selection_Card_Count(),
                }),
            ]);

            await this.Refresh();
        }
    }

    On_Death():
        void
    {
        this.resize_observer.disconnect();
        this.current_height = 0;
        this.current_width = 0;
    }
}

type Menu_Props = {
    model: Model.Menu;
    parent: Main;
    event_grid: Event.Grid;
}

class Menu extends Component<Menu_Props>
{
    private top: Menu_Top | null = null;
    private options: Menu_Options | null = null;

    Main():
        Main
    {
        return this.Parent();
    }

    Top():
        Menu_Top
    {
        if (this.top == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.top;
        }
    }

    Options():
        Menu_Options
    {
        if (this.options == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.options;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `1`,

            backgroundColor: `rgba(0, 0, 0, 0.3)`,
        });
    }

    On_Refresh():
        JSX.Element
    {
        const model: Model.Menu = this.Model();
        const current_menu: Model.Menu_e = model.Current_Menu();

        if (current_menu === Model.Menu_e.TOP) {
            return (
                <div
                    className={`Menu`}
                    style={this.Styles()}
                >
                    <Menu_Top
                        key={`menu_top`}
                        ref={ref => this.top = ref}

                        model={this.Model().Top()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else if (current_menu === Model.Menu_e.OPTIONS) {
            return (
                <div
                    className={`Menu`}
                    style={this.Styles()}
                >
                    <Menu_Options
                        key={`menu_options`}
                        ref={ref => this.options = ref}

                        model={this.Model().Options()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else {
            Assert(false);

            return <div></div>;
        }
    }

    On_Life():
        Event.Listener_Info[]
    {
        return [
            {
                event_name: new Event.Name(ON, OPEN_OPTIONS_MENU),
                event_handler: this.On_Open_Options,
            },
        ];
    }

    async On_Open_Options():
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Open_Options();

            await this.Refresh();
        }
    }
}

type Menu_Button_Props = {
    model: Model.Menu;
    parent: any;
    event_grid: Event.Grid;
}

class Menu_Button extends Component<Menu_Button_Props>
{
    private cover: Menu_Button_Cover | null = null;

    Cover():
        Menu_Button_Cover
    {
        if (this.cover == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.cover;
        }
    }

    Text():
        string
    {
        return ``;
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `40%`,
            height: `100%`,

            position: `relative`,

            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: `rgba(0, 0, 0, 0.7)`,
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            fontSize: `2.5em`,

            cursor: `pointer`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Menu_Button`}
                style={this.Styles()}
                onClick={this.On_Click.bind(this)}
            >
                <div>
                    {this.Text()}
                </div>
                <Menu_Button_Cover
                    key={`menu_button_cover`}
                    ref={ref => this.cover = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
    }
}

type Menu_Button_Cover_Props = {
    model: Model.Menu;
    parent: Menu_Button;
    event_grid: Event.Grid;
}

class Menu_Button_Cover extends Component<Menu_Button_Cover_Props>
{
    Menu_Button():
        Menu_Button
    {
        return this.Parent();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `1`,

            backgroundColor: `transparent`,
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            cursor: `pointer`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Menu_Button_Cover`}
                style={this.Styles()}
                onClick={this.Parent().On_Click.bind(this)}
            >
            </div>
        );
    }
}

type Menu_Top_Props = {
    model: Model.Menu_Top;
    parent: Menu;
    event_grid: Event.Grid;
}

class Menu_Top extends Component<Menu_Top_Props>
{
    private title: Menu_Top_Title | null = null;
    private buttons: Menu_Top_Buttons | null = null;

    Menu():
        Menu
    {
        return this.Parent();
    }

    Title():
        Menu_Top_Title
    {
        if (this.title == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.title;
        }
    }

    Buttons():
        Menu_Top_Buttons
    {
        if (this.buttons == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.buttons;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `45% 55%`,
            rowGap: `0`,

            width: `100%`,
            height: `100%`,

            backgroundColor: `rgba(0, 0, 0, 0.7)`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Menu`}
                style={this.Styles()}
            >
                <Menu_Top_Title
                    key={`menu_title`}
                    ref={ref => this.title = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Menu_Top_Buttons
                    key={`menu_buttons`}
                    ref={ref => this.buttons = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }
}

type Menu_Top_Title_Props = {
    model: Model.Menu_Top;
    parent: Menu_Top;
    event_grid: Event.Grid;
}

class Menu_Top_Title extends Component<Menu_Top_Title_Props>
{
    Top():
        Menu_Top
    {
        return this.Parent();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,

            width: `100%`,
            height: `100%`,

            fontSize: `5em`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Menu_Title`}
                style={this.Styles()}
            >
                <div>{`Triple Triad`}</div>
            </div>
        );
    }
}

type Menu_Top_Buttons_Props = {
    model: Model.Menu_Top;
    parent: Menu_Top;
    event_grid: Event.Grid;
}

class Menu_Top_Buttons extends Component<Menu_Top_Buttons_Props>
{
    private new_game: Menu_Top_New_Game_Button | null = null;
    private options: Menu_Top_Options_Button | null = null;

    Top():
        Menu_Top
    {
        return this.Parent();
    }

    New_Game():
        Menu_Top_New_Game_Button
    {
        if (this.new_game == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.new_game;
        }
    }

    Options():
        Menu_Top_Options_Button
    {
        if (this.options == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.options;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `1fr 1fr 1fr`,
            rowGap: `5%`,

            width: `100%`,
            height: `100%`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Menu_Buttons`}
                style={this.Styles()}
            >
                <Menu_Top_New_Game_Button
                    key={`menu_new_game_button`}
                    ref={ref => this.new_game = ref}

                    model={this.Model().Menu()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Menu_Top_Options_Button
                    key={`menu_options_button`}
                    ref={ref => this.options = ref}

                    model={this.Model().Menu()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }
}

class Menu_Top_New_Game_Button extends Menu_Button
{
    Text():
        string
    {
        return `New Game`;
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        this.Send({
            name_affix: START_NEW_GAME,
            name_suffixes: [
            ],
            data: {
            } as Start_New_Game_Data,
            is_atomic: true,
        });
    }
}

class Menu_Top_Options_Button extends Menu_Button
{
    Text():
        string
    {
        return `Options`;
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        this.Send({
            name_affix: OPEN_OPTIONS_MENU,
            name_suffixes: [
            ],
            data: {
            } as Open_Options_Menu_Data,
            is_atomic: true,
        });
    }
}

type Menu_Options_Props = {
    model: Model.Menu_Options;
    parent: Menu;
    event_grid: Event.Grid;
}

class Menu_Options extends Component<Menu_Options_Props>
{
    Menu():
        Menu
    {
        return this.Parent();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr 1fr`,
            gridTemplateRows: `1fr 1fr 1fr`,
            columnGap: `3%`,
            rowGap: `5%`,

            width: `90%`,
            height: `90%`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: `rgba(0, 0, 0, 0.7)`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Menu_Options`}
                style={this.Styles()}
            >
                Hallo
            </div>
        );
    }
}

type Exhibitions_Props = {
    model: Model.Main;
    parent: Main;
    event_grid: Event.Grid;
}

class Exhibitions extends Component<Exhibitions_Props>
{
    private exhibitions: Array<Exhibition | null> =
        new Array(this.Model().Exhibition_Count()).fill(null);
    private exhibition_event_grids: Array<Event.Grid> =
        Array.from(new Array(this.Model().Exhibition_Count()).fill(null).map(() => new Event.Grid()));

    Main():
        Main
    {
        return this.Parent();
    }

    Exhibition(exhibition_index: Model.Exhibition_Index):
        Exhibition
    {
        if (exhibition_index == null || exhibition_index < 0 || exhibition_index >= this.exhibitions.length) {
            throw new Error(`'exhibition_index' ${exhibition_index} is invalid.`);
        } else if (this.exhibitions[exhibition_index] == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.exhibitions[exhibition_index] as Exhibition;
        }
    }

    Exhibitions():
        Array<Exhibition>
    {
        const exhibitions: Array<Exhibition> = [];
        for (const exhibition of this.exhibitions) {
            if (exhibition == null) {
                throw this.Error_Not_Rendered();
            } else {
                exhibitions.push(exhibition);
            }
        }

        return exhibitions;
    }

    Exhibition_Event_Grid(exhibition_index: Model.Exhibition_Index):
        Event.Grid
    {
        if (exhibition_index == null || exhibition_index < 0 || exhibition_index >= this.exhibitions.length) {
            throw new Error(`'exhibition_index' ${exhibition_index} is invalid.`);
        } else {
            return this.exhibition_event_grids[exhibition_index] as Event.Grid;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,

            filter: `blur(0.1vmin)`, // I'm not sure, maybe doing pixels would be best?
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Main = this.Model();
        const exhibition_count: Model.Exhibition_Count = model.Exhibition_Count();

        return (
            <div
                className={`Exhibitions`}
                style={this.Styles()}
            >
                {
                    Array(exhibition_count).fill(null).map((_, exhibition_index: Model.Exhibition_Index) =>
                    {
                        return (
                            <Exhibition
                                key={`exhibition_${exhibition_index}`}
                                ref={ref => this.exhibitions[exhibition_index] = ref}

                                model={model.Exhibition(exhibition_index)}
                                parent={this}
                                event_grid={this.Exhibition_Event_Grid(exhibition_index)}
                            />
                        );
                    })
                }
            </div>
        );
    }
}

type Exhibition_Props = {
    model: Model.Exhibition;
    parent: Exhibitions;
    event_grid: Event.Grid;
}

class Exhibition extends Component<Exhibition_Props>
{
    private arena: Arena | null = null;

    Exhibitions():
        Exhibitions
    {
        return this.Parent();
    }

    Arena():
        Arena
    {
        if (this.arena == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.arena;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Exhibition = this.Model();

        this.Change_Style(`visibility`, this.Model().Is_Visible() ? `visible` : `hidden`);

        return (
            <div
                className={`Exhibition`}
                style={this.Styles()}
            >
                <Arena
                    key={`arena_${model.Iteration_Count()}`}
                    ref={ref => this.arena = ref}

                    model={model.Arena()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        return ([
            {
                event_name: new Event.Name(AFTER, GAME_STOP),
                event_handler: this.After_Game_Stop,
            },
        ]);
    }

    async After_Game_Stop():
        Promise<void>
    {
        if (this.Is_Alive()) {
            await Wait(5000);
            if (this.Is_Alive()) {
                this.Model().Regenerate();
                await this.Refresh();
            }
        }
    }
}

type Arena_Props = {
    model: Model.Arena;
    parent: Main | Exhibition;
    event_grid: Event.Grid;
}

class Arena extends Component<Arena_Props>
{
    private players: Array<Player | null> = new Array(this.Model().Player_Count()).fill(null);
    private board: Board | null = null;
    private results: Results | null = null;

    Player(player_index: Model.Player_Index):
        Player
    {
        if (player_index < 0 || player_index >= this.players.length) {
            throw new Error(`'player_index' ${player_index} is invalid.`);
        } else if (this.players[player_index] == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.players[player_index] as Player;
        }
    }

    Players():
        Array<Player>
    {
        const players: Array<Player> = [];
        for (const player of this.players) {
            if (player == null) {
                throw this.Error_Not_Rendered();
            } else {
                players.push(player);
            }
        }

        return players;
    }

    Board():
        Board
    {
        if (this.board == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.board;
        }
    }

    Results():
        Results
    {
        if (this.results == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.results;
        }
    }

    CSS_Card_Width():
        string
    {
        return `calc(${this.CSS_Card_Height()} * 4 / 5)`
    }

    CSS_Card_Height():
        string
    {
        // I would actually like to get the width and height of the root element,
        // which should exist at all times, and just use that to derive all
        // measurements. that way we can size it depending on the actual container
        // instead of the viewport or anything else. we might even decide here
        // if we need to go by the width, when they size of the players would be
        // bigger than the root width. so we go with whichever is bigger. Or maybe
        // we can figure how to always go by width?
        const row_count: Model.Row_Count = this.Model().Rules().Row_Count();

        return `
            calc(
                (
                    ${this.CSS_Board_Cells_Height()} -
                    (${this.CSS_Board_Cells_Padding()} * 2) -
                    (${this.CSS_Board_Cells_Grid_Gap()} * ${row_count - 1})
                ) /
                ${row_count}
            )
        `;
    }

    CSS_Bumper_Height():
        string
    {
        return `8vmin`;
    }

    CSS_Player_Width():
        string
    {
        return `calc(${this.CSS_Card_Width()} * 1.07)`;
    }

    CSS_Board_Cells_Height():
        string
    {
        return `calc(100vmin - ${this.CSS_Bumper_Height()})`;
    }

    CSS_Board_Cells_Padding():
        string
    {
        return `2vmin`;
    }

    CSS_Board_Cells_Grid_Gap():
        string
    {
        return `0.5vmin`;
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `row`,
            justifyContent: `center`,

            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Arena = this.Model();
        const player_count: number = model.Player_Count();
        const left_player_count: number = Math.floor(player_count / 2);
        const right_player_count: number = player_count - left_player_count;

        return (
            <div
                className={`Arena`}
                style={this.Styles()}
            >
                <div
                    className={`Player_Grid`}
                    style={{
                        display: `grid`,
                        gridTemplateColumns: `repeat(${left_player_count}, 1fr)`,
                        gridTemplateRows: `auto`,
                        gridGap: `0 0`,

                        height: `100%`,
                        padding: `0 calc((${this.CSS_Player_Width()} - ${this.CSS_Card_Width()}) / 2)`,
                    }}
                >
                    {
                        Array(left_player_count).fill(null).map((_, index: Model.Player_Index) =>
                        {
                            const player_index: Model.Player_Index = index + 0;

                            return (
                                <Player
                                    key={`player_${player_index}`}
                                    ref={ref => this.players[player_index] = ref}

                                    model={model.Player(player_index)}
                                    parent={this}
                                    event_grid={this.Event_Grid()}
                                />
                            );
                        })
                    }
                </div>
                <Board
                    key={`board`}
                    ref={ref => this.board = ref}

                    model={model.Board()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <div
                    className={`Player_Grid`}
                    style={{
                        display: `grid`,
                        gridTemplateColumns: `repeat(${right_player_count}, 1fr)`,
                        gridTemplateRows: `auto`,
                        gridGap: `0 0`,

                        height: `100%`,
                        padding: `0 calc((${this.CSS_Player_Width()} - ${this.CSS_Card_Width()}) / 2)`,
                    }}
                >
                    {
                        Array(right_player_count).fill(null).map((_, index: Model.Player_Index) =>
                        {
                            const player_index: Model.Player_Index = index + left_player_count;

                            return (
                                <Player
                                    key={`player_${player_index}`}
                                    ref={ref => this.players[player_index] = ref}

                                    model={model.Player(player_index)}
                                    parent={this}
                                    event_grid={this.Event_Grid()}
                                />
                            );
                        })
                    }
                </div>
                <Results
                    key={`results`}
                    ref={ref => this.results = ref}

                    model={model}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        this.Send({
            name_affix: GAME_START,
            name_suffixes: [
            ],
            data: {
            } as Game_Start_Data,
            is_atomic: true,
        });

        return ([
            {
                event_name: new Event.Name(ON, GAME_START),
                event_handler: this.On_Game_Start,
            },
            {
                event_name: new Event.Name(ON, PLAYER_STOP_TURN),
                event_handler: this.On_Player_Stop_Turn,
            },
        ]);
    }

    async On_Game_Start(
        {
        }: Game_Start_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const current_player_index: Model.Player_Index = this.Model().Current_Player_Index();

            this.Send({
                name_affix: PLAYER_START_TURN,
                name_suffixes: [
                    current_player_index.toString(),
                ],
                data: {
                    player_index: current_player_index,
                } as Player_Start_Turn_Data,
                is_atomic: true,
            });
        }
    }

    async On_Player_Stop_Turn(
        {
        }: Player_Stop_Turn_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Next_Turn();

            if (this.Model().Is_Game_Over()) {
                const scores: Model.Scores = this.Model().Scores() as Model.Scores;
                Assert(scores != null);

                this.Send({
                    name_affix: GAME_STOP,
                    name_suffixes: [
                    ],
                    data: {
                        scores,
                    } as Game_Stop_Data,
                    is_atomic: true,
                });
            } else {
                const current_player_index: Model.Player_Index = this.Model().Current_Player_Index();

                this.Send({
                    name_affix: PLAYER_START_TURN,
                    name_suffixes: [
                        current_player_index.toString(),
                    ],
                    data: {
                        player_index: current_player_index,
                    } as Player_Start_Turn_Data,
                    is_atomic: true,
                });
            }
        }
    }
}

type Player_Props = {
    model: Model.Player;
    parent: Arena;
    event_grid: Event.Grid;
}

class Player extends Component<Player_Props>
{
    private bumper: Player_Bumper | null = null;
    private hand: Player_Hand | null = null;

    Arena():
        Arena
    {
        return this.Parent();
    }

    Bumper():
        Player_Bumper
    {
        if (this.bumper == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.bumper;
        }
    }

    Hand():
        Player_Hand
    {
        if (this.hand == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.hand;
        }
    }

    Index():
        Model.Player_Index
    {
        return this.Model().Index();
    }

    CSS_Width():
        string
    {
        return this.Arena().CSS_Player_Width();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            alignItems: `center`,

            width: this.CSS_Width(),
            height: `100%`,

            position: `relative`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player = this.Model();
        const event_grid: Event.Grid = this.Event_Grid();
        const index: Model.Player_Index = this.Index();

        return (
            <div
                className={`Player`}
                style={this.Styles()}
            >
                <Player_Bumper
                    key={`player_bumper_${index}`}
                    ref={ref => this.bumper = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Player_Hand
                    key={`player_hand_${index}`}
                    ref={ref => this.hand = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        const player_index: Model.Player_Index = this.Index();

        return ([
            {
                event_name: new Event.Name(ON, PLAYER_START_TURN, player_index.toString()),
                event_handler: this.On_This_Player_Start_Turn,
            },
            {
                event_name: new Event.Name(ON, PLAYER_SELECT_STAKE, player_index.toString()),
                event_handler: this.On_This_Player_Select_Stake,
            },
            {
                event_name: new Event.Name(ON, PLAYER_PLACE_STAKE, player_index.toString()),
                event_handler: this.On_This_Player_Place_Stake,
            },
        ]);
    }

    async On_This_Player_Start_Turn(
        {
            player_index,
        }: Player_Start_Turn_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();

            if (this.Is_Alive()) {
                // Highlight the player to indicate it's their turn.
                const color: Model.Color = this.Model().Color();
                this.Change_Style(
                    `backgroundColor`,
                    `rgba(
                        ${color.Red()},
                        ${color.Green()},
                        ${color.Blue()},
                        ${color.Alpha() * PLAYER_ALPHA_HIGHLIGHT_MULTIPLIER}
                    )`,
                );

                // We need to simulate the computer_player choosing a card
                if (this.Model().Is_Computer()) {
                    const computer_player: Model.Computer_Player =
                        this.Model() as Model.Computer_Player;
                    const {
                        selection_indices,
                        cell_index,
                    } = await computer_player.Choose_Stake_And_Cell();

                    if (this.Is_Alive()) {
                        for (const selection_index of selection_indices) {
                            await this.Send({
                                name_affix: PLAYER_SELECT_STAKE,
                                name_suffixes: [
                                    player_index.toString(),
                                ],
                                data: {
                                    player_index,
                                    stake_index: selection_index,
                                } as Player_Select_Stake_Data,
                                is_atomic: true,
                            });

                            if (this.Is_Alive()) {
                                // might be fun to randomize this
                                await Wait(AI_SELECTION_WAIT_MILLISECONDS);

                                if (this.Is_Dead()) {
                                    return;
                                }
                            } else {
                                return;
                            }
                        }

                        this.Send({
                            name_affix: PLAYER_PLACE_STAKE,
                            name_suffixes: [
                                player_index.toString(),
                            ],
                            data: {
                                player_index,
                                stake_index: selection_indices[selection_indices.length - 1],
                                cell_index,
                            } as Player_Place_Stake_Data,
                            is_atomic: true,
                        });
                    }
                }
            }
        }
    }

    async On_This_Player_Select_Stake(
        {
            stake_index,
        }: Player_Select_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const previous_selected_stake_index: Model.Stake_Index | null =
                this.Model().Selected_Stake_Index();
            if (previous_selected_stake_index !== stake_index) {
                this.Model().Select_Stake(stake_index);
                this.Hand().Stake(stake_index).Refresh();

                if (previous_selected_stake_index != null) {
                    this.Hand().Stake(previous_selected_stake_index).Refresh();
                }
            }
        }
    }

    async On_This_Player_Place_Stake(
        {
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            // Remove the player highlight to indicate that selection is over.
            this.Change_Style(`backgroundColor`, `transparent`);
        }
    }
}

type Player_Bumper_Props = {
    model: Model.Player;
    parent: Player;
    event_grid: Event.Grid;
}

class Player_Bumper extends Component<Player_Bumper_Props>
{
    private name: Player_Name | null = null;
    private score: Player_Score | null = null;

    Arena():
        Arena
    {
        return this.Player().Arena();
    }

    Player():
        Player
    {
        return this.Parent();
    }

    Name():
        Player_Name
    {
        if (this.name == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.name;
        }
    }

    Score():
        Player_Score
    {
        if (this.score == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.score;
        }
    }

    Index():
        Model.Player_Index
    {
        return this.Model().Index();
    }

    Before_Life():
        Component_Styles
    {
        const arena: Arena = this.Arena();

        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `1fr 1fr`,

            width: arena.CSS_Card_Width(),
            height: arena.CSS_Bumper_Height(),
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player = this.Model();
        const event_grid: Event.Grid = this.Event_Grid();
        const index: Model.Player_Index = this.Index();

        return (
            <div
                className={`Player_Bumper`}
                style={this.Styles()}
            >
                <Player_Name
                    key={`player_name_${index}`}
                    ref={ref => this.name = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Player_Score
                    key={`player_score_${index}`}
                    ref={ref => this.score = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        return ([
            {
                event_name: new Event.Name(ON, GAME_STOP),
                event_handler: this.On_Game_Stop,
            },
        ]);
    }

    async On_Game_Stop(
        {
        }: Game_Stop_Data
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const color: Model.Color = this.Model().Color();
            this.Change_Style(
                `backgroundColor`,
                `rgba(
                    ${color.Red()},
                    ${color.Green()},
                    ${color.Blue()},
                    ${color.Alpha() * PLAYER_ALPHA_HIGHLIGHT_MULTIPLIER}
                )`
            );
        }
    }
}

type Player_Name_Props = {
    model: Model.Player;
    parent: Player_Bumper;
    event_grid: Event.Grid;
}

class Player_Name extends Component<Player_Name_Props>
{
    Player_Bumper():
        Player_Bumper
    {
        return this.Parent();
    }

    Index():
        Model.Player_Index
    {
        return this.Model().Index();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Player_Name`}
                style={this.Styles()}
            >
                {
                    this.Model().Name()
                }
            </div>
        );
    }
}

type Player_Score_Props = {
    model: Model.Player;
    parent: Player_Bumper;
    event_grid: Event.Grid;
}

class Player_Score extends Component<Player_Score_Props>
{
    Player_Bumper():
        Player_Bumper
    {
        return this.Parent();
    }

    Index():
        Model.Player_Index
    {
        return this.Model().Index();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Player_Score`}
                style={this.Styles()}
            >
                {
                    this.Model().Score()
                }
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        return ([
            {
                event_name: new Event.Name(ON, PLAYER_STOP_TURN),
                event_handler: this.On_Player_Stop_Turn,
            },
            {
                event_name: new Event.Name(ON, GAME_STOP),
                event_handler: this.On_Game_Stop,
            },
        ]);
    }

    async On_Player_Stop_Turn(
        {
        }: Player_Stop_Turn_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();
        }
    }

    async On_Game_Stop(
        {
        }: Game_Stop_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();
        }
    }
}

type Player_Hand_Props = {
    model: Model.Player;
    parent: Player;
    event_grid: Event.Grid;
}

class Player_Hand extends Component<Player_Hand_Props>
{
    private stakes: Array<Player_Stake | null> = new Array(this.Model().Stake_Count()).fill(null);

    Arena():
        Arena
    {
        return this.Player().Arena();
    }

    Player():
        Player
    {
        return this.Parent();
    }

    Stake(stake_index: Model.Stake_Index):
        Player_Stake
    {
        if (stake_index < 0 || stake_index >= this.stakes.length) {
            throw new Error(`'stake_index' of ${stake_index} is invalid.`);
        } else if (this.stakes[stake_index] == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.stakes[stake_index] as Player_Stake;
        }
    }

    Stakes():
        Array<Player_Stake>
    {
        const stakes: Array<Player_Stake> = [];
        for (const stake of this.stakes) {
            if (stake == null) {
                throw this.Error_Not_Rendered();
            } else {
                stakes.push(stake);
            }
        }

        return stakes;
    }

    Index():
        Model.Player_Index
    {
        return this.Model().Index();
    }

    Before_Life():
        Component_Styles
    {
        const arena: Arena = this.Arena();

        return ({
            position: `relative`,

            width: arena.CSS_Card_Width(),
            height: arena.CSS_Board_Cells_Height(),
            overflowX: `hidden`,
            overflowY: `auto`,

            scrollbarWidth: `none`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const stake_count: Model.Stake_Count = this.Model().Stake_Count();

        return (
            <div
                className={`Player_Hand`}
                style={this.Styles()}
            >
                {
                    Array(stake_count).fill(null).map((_, stake_index: Model.Stake_Index) =>
                    {
                        return (
                            <Player_Stake
                                key={`player_stake_${stake_index}`}
                                ref={ref => this.stakes[stake_index] = ref}

                                model={this.Model().Stake(stake_index)}
                                parent={this}
                                event_grid={this.Event_Grid()}
                                index={stake_index}
                            />
                        );
                    })
                }
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        const player_index: Model.Player_Index = this.Index();

        return ([
            {
                event_name: new Event.Name(ON, PLAYER_PLACE_STAKE, player_index.toString()),
                event_handler: this.On_This_Player_Place_Stake,
            },
        ]);
    }

    async On_This_Player_Place_Stake(
        {
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();
        }
    }
}

type Player_Stake_Props = {
    model: Model.Stake;
    parent: Player_Hand;
    event_grid: Event.Grid;
    index: Model.Stake_Index;
}

class Player_Stake extends Component<Player_Stake_Props>
{
    Arena():
        Arena
    {
        return this.Player().Arena();
    }

    Player():
        Player
    {
        return this.Player_Hand().Player();
    }

    Player_Hand():
        Player_Hand
    {
        return this.Parent();
    }

    Index():
        Model.Stake_Index
    {
        return this.props.index;
    }

    Before_Life():
        Component_Styles
    {
        const arena: Arena = this.Arena();

        return ({
            width: arena.CSS_Card_Width(),
            height: arena.CSS_Card_Height(),

            position: `absolute`,
            left: `0`,
            top: `0`,

            backgroundSize: `90% 90%`,

            cursor: `default`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const arena: Arena = this.Arena();
        const model: Model.Stake = this.Model();
        const color: Model.Color = model.Color();
        const is_of_human: boolean = this.Model().Is_Of_Human();
        const is_selectable: boolean = this.Model().Is_Selectable();

        if (model.Is_Selected()) {
            this.Change_Style(`border`, `0.15vmin solid white`);
        } else {
            this.Change_Style(`border`, `0.15vmin solid black`);
        }

        this.Change_Style(
            `backgroundColor`,
            `rgba(
                ${color.Red()},
                ${color.Green()},
                ${color.Blue()},
                ${color.Alpha()}
            )`,
        );
        this.Change_Style(`backgroundImage`, `url("${model.Card().Image()}")`);

        this.Change_Style(
            `top`,
            `calc(
                ${arena.CSS_Card_Height()} *
                ${PLAYER_STAKE_HEIGHT_MULTIPLIER} *
                ${this.Index()}
            )`,
        );
        this.Change_Style(`zIndex`, `${this.Index()}`);

        return (
            <div
                className={`Player_Stake`}
                style={this.Styles()}
                onClick={
                    is_of_human && is_selectable ?
                        event => this.On_Click(event) :
                        () => { }
                }
            >
            </div>
        );
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            event.stopPropagation();

            const arena: Model.Arena = this.Model().Arena();
            if (arena.Is_Input_Enabled()) {
                arena.Disable_Input();

                if (this.Model().Is_On_Player()) {
                    const player: Model.Player = this.Model().Origin();
                    if (player.Is_On_Turn()) {
                        const player_index: Model.Player_Index = player.Index();
                        const stake_index: Model.Stake_Index = this.Index();

                        await this.Send({
                            name_affix: PLAYER_SELECT_STAKE,
                            name_suffixes: [
                                player_index.toString(),
                            ],
                            data: {
                                player_index,
                                stake_index,
                            } as Player_Select_Stake_Data,
                            is_atomic: true,
                        });
                    }
                }

                arena.Enable_Input();
            }
        }
    }

    On_Life():
        Event.Listener_Info[]
    {
        const player_index: Model.Player_Index = this.Player().Index();

        return ([
            {
                event_name: new Event.Name(ON, PLAYER_START_TURN, player_index.toString()),
                event_handler: this.On_This_Player_Start_Turn,
            },
            {
                event_name: new Event.Name(ON, PLAYER_SELECT_STAKE, player_index.toString()),
                event_handler: this.On_This_Player_Select_Stake,
            },
            {
                event_name: new Event.Name(BEFORE, PLAYER_PLACE_STAKE, player_index.toString()),
                event_handler: this.Before_This_Player_Place_Stake,
            },
            {
                event_name: new Event.Name(ON, PLAYER_PLACE_STAKE, player_index.toString()),
                event_handler: this.On_This_Player_Place_Stake,
            },
        ]);
    }

    async On_This_Player_Start_Turn(
        {
        }: Player_Start_Turn_Data
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (this.Model().Is_Of_Human()) {
                this.Change_Style(`cursor`, `pointer`);
            }
        }
    }

    async On_This_Player_Select_Stake(
        {
            stake_index,
        }: Player_Select_Stake_Data
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (this.Model().Is_Of_Human()) {
                if (this.Index() === stake_index) {
                    this.Change_Style(`cursor`, `default`);
                } else {
                    this.Change_Style(`cursor`, `pointer`);
                }
            }
        }
    }

    async Before_This_Player_Place_Stake(
        {
            stake_index,
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (stake_index === this.Index()) {
                this.Change_Style(`animationName`, `Player_Stake_Twinkle`);
                this.Change_Style(`animationDuration`, `${500}ms`);
                this.Change_Style(`animationTimingFunction`, `ease-in-out`);
                this.Change_Style(`animationIterationCount`, `1`);
                this.Change_Style(`animationDirection`, `normal`);

                await Wait(500);
                if (this.Is_Alive()) {
                    this.Change_Style(`animationName`, ``);
                    this.Change_Style(`animationDuration`, ``);
                    this.Change_Style(`animationTimingFunction`, ``);
                    this.Change_Style(`animationIterationCount`, ``);
                    this.Change_Style(`animationDirection`, ``);

                    await Wait(100);
                }
            }
        }
    }

    async On_This_Player_Place_Stake(
        {
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (this.Model().Is_Of_Human()) {
                this.Change_Style(`cursor`, `default`);
            }
        }
    }
}

type Board_Props = {
    model: Model.Board;
    parent: Arena;
    event_grid: Event.Grid;
}

class Board extends Component<Board_Props>
{
    private bumper: Board_Bumper | null = null;
    private cells: Board_Cells | null = null;

    Arena():
        Arena
    {
        return this.Parent();
    }

    Bumper():
        Board_Bumper
    {
        if (this.bumper == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.bumper;
        }
    }

    Cells():
        Board_Cells
    {
        if (this.cells == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.cells;
        }
    }

    Before_Life():
        Component_Styles
    {
        const arena: Arena = this.Arena();

        return ({
            display: `grid`,
            gridTemplateColumns: `auto`,
            gridTemplateRows: `${arena.CSS_Bumper_Height()} ${arena.CSS_Board_Cells_Height()}`,

            height: `100%`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        this.Change_Style(`backgroundImage`, `url("img/boards/pexels-fwstudio-172296.jpg")`);

        return (
            <div
                className={`Board`}
                style={this.Styles()}
            >
                <Board_Bumper
                    key={`board_bumper`}
                    ref={ref => this.bumper = ref}

                    parent={this}
                    event_grid={this.Event_Grid()}
                    model={this.Model()}
                />
                <Board_Cells
                    key={`board_cells`}
                    ref={ref => this.cells = ref}

                    parent={this}
                    event_grid={this.Event_Grid()}
                    model={this.Model()}
                />
            </div >
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        return ([
            {
                event_name: new Event.Name(ON, PLAYER_PLACE_STAKE),
                event_handler: this.On_Player_Place_Stake,
            },
        ]);
    }

    async On_Player_Place_Stake(
        {
            player_index,
            cell_index,
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const turn_result_steps: Model.Turn_Result_Steps =
                await this.Model().Place_Current_Player_Selected_Stake(cell_index);
            if (this.Is_Alive()) {
                for (const turn_result_step of turn_result_steps) {
                    await Promise.all(turn_result_step.map(async function (
                        this: Board,
                        turn_result: Model.Turn_Result,
                    ):
                        Promise<void>
                    {
                        await this.Send({
                            name_affix: BOARD_CHANGE_CELL,
                            name_suffixes: [
                                turn_result.cell_index.toString(),
                            ],
                            data: {
                                cell_index: turn_result.cell_index,
                                turn_result: turn_result,
                            } as Board_Change_Cell_Data,
                            is_atomic: true,
                        });
                    }, this));

                    if (this.Is_Dead()) {
                        return;
                    }
                }

                this.Send({
                    name_affix: PLAYER_STOP_TURN,
                    name_suffixes: [
                        player_index.toString(),
                    ],
                    data: {
                        player_index,
                    } as Player_Stop_Turn_Data,
                    is_atomic: true,
                });
            }
        }
    }
}

type Board_Bumper_Props = {
    model: Model.Board;
    parent: Board;
    event_grid: Event.Grid;
}

class Board_Bumper extends Component<Board_Bumper_Props>
{
    Arena():
        Arena
    {
        return this.Board().Arena();
    }

    Board():
        Board
    {
        return this.Parent();
    }

    CSS_Height():
        string
    {
        return this.Arena().CSS_Bumper_Height();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Board_Bumper`}
                style={this.Styles()}
            >
            </div >
        );
    }
}

type Board_Cells_Props = {
    model: Model.Board;
    parent: Board;
    event_grid: Event.Grid;
}

class Board_Cells extends Component<Board_Cells_Props>
{
    private cells: Array<Board_Cell | null> = new Array(this.Model().Cell_Count()).fill(null);

    Arena():
        Arena
    {
        return this.Board().Arena();
    }

    Board():
        Board
    {
        return this.Parent();
    }

    Cell(cell_index: Model.Cell_Index):
        Board_Cell
    {
        if (cell_index < 0 || cell_index >= this.cells.length) {
            throw new Error(`'cell_index' of ${cell_index} is invalid.`);
        } else if (this.cells[cell_index] == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.cells[cell_index] as Board_Cell;
        }
    }

    Cells():
        Array<Board_Cell>
    {
        const cells: Array<Board_Cell> = [];
        for (const cell of this.cells) {
            if (cell == null) {
                throw this.Error_Not_Rendered();
            } else {
                cells.push(cell);
            }
        }

        return cells;
    }

    CSS_Height():
        string
    {
        return this.Arena().CSS_Board_Cells_Height();
    }

    CSS_Padding():
        string
    {
        return this.Arena().CSS_Board_Cells_Padding();
    }

    CSS_Grid_Gap():
        string
    {
        return this.Arena().CSS_Board_Cells_Grid_Gap();
    }

    Before_Life():
        Component_Styles
    {
        const rules: Model.Rules = this.Model().Rules();
        const grid_gap: string = this.CSS_Grid_Gap();

        return ({
            display: `grid`,
            gridTemplateColumns: `repeat(${rules.Column_Count()}, 1fr)`,
            gridTemplateRows: `repeat(${rules.Row_Count()}, 1fr)`,
            gridGap: `${grid_gap} ${grid_gap}`,

            width: `100%`,
            height: `100%`,
            padding: this.CSS_Padding(),
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Board_Cells`}
                style={this.Styles()}
            >
                {
                    Array(this.Model().Cell_Count()).fill(null).map((_, cell_index: Model.Cell_Index) =>
                    {
                        return (
                            <Board_Cell
                                key={cell_index}
                                ref={ref => this.cells[cell_index] = ref}

                                parent={this}
                                event_grid={this.Event_Grid()}
                                model={() => this.Model().Cell(cell_index)}
                                index={cell_index}
                            />
                        );
                    })
                }
            </div>
        );
    }
}

type Board_Cell_Props = {
    model: () => Model.Cell;
    parent: Board_Cells;
    event_grid: Event.Grid;
    index: Model.Cell_Index;
}

class Board_Cell extends Component<Board_Cell_Props>
{
    private current_color: Model.Color | null = null;
    private popups: Array<JSX.Element> | null = null;

    Arena():
        Arena
    {
        return this.Board().Arena();
    }

    Board():
        Board
    {
        return this.Cells().Board();
    }

    Cells():
        Board_Cells
    {
        return this.Parent();
    }

    Index():
        Model.Cell_Index
    {
        return this.props.index;
    }

    Before_Life():
        Component_Styles
    {
        const arena: Arena = this.Arena();

        return ({
            display: `grid`,
            gridTemplateColumns: `4fr 3fr 4fr 3fr 4fr`,
            gridTemplateRows: `4fr 3fr 4fr 3fr 4fr`,
            columnGap: `5%`,

            width: arena.CSS_Card_Width(),
            height: arena.CSS_Card_Height(),

            border: `0.3vmin solid #00000080`,

            cursor: `default`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model = this.Model()();

        if (model.Is_Empty()) {
            const is_on_human_turn: boolean = this.Board().Model().Is_On_Human_Turn();
            const is_selectable: boolean = this.Board().Model().Is_Cell_Selectable(this.Index());

            if (is_on_human_turn && is_selectable) {
                this.Change_Style('cursor', `pointer`);
            } else {
                this.Change_Style('cursor', `default`);
            }

            return (
                <div
                    className={`Board_Cell`}
                    style={this.Styles()}
                    onClick={event => this.On_Click(event)}
                >
                </div>
            );
        } else {
            Assert(this.current_color != null);

            const color: Model.Color = this.current_color as Model.Color;

            this.Change_Style(
                `backgroundColor`,
                `rgba(
                    ${color.Red()},
                    ${color.Green()},
                    ${color.Blue()},
                    ${color.Alpha()}
                )`,
            );

            return (
                <div
                    className={`Board_Cell`}
                    style={this.Styles()}
                >
                    <div
                        className={`Board_Cell_Card`}
                        style={{
                            width: `90%`,
                            height: `90%`,

                            gridColumn: `1 / span 5`,
                            gridRow: `1 / span 5`,
                            alignSelf: `center`,
                            justifySelf: `center`,
                            zIndex: `0`,

                            backgroundImage: `url("${model.Stake().Card().Image()}")`,
                        }}
                    >
                    </div>
                    {
                        this.popups ?
                            this.popups :
                            []
                    }
                </div>
            );
        }
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            event.stopPropagation();

            const arena: Model.Arena = this.Board().Model().Arena();
            if (arena.Is_On_Human_Turn() && arena.Is_Input_Enabled()) {
                arena.Disable_Input();

                if (this.Board().Model().Is_Cell_Selectable(this.Index())) {
                    const player_index: Model.Player_Index =
                        this.Board().Model().Current_Player_Index();
                    const stake_index: Model.Stake_Index =
                        this.Arena().Model().Current_Player().Selected_Stake_Index() as Model.Stake_Index;
                    const cell_index: Model.Cell_Index =
                        this.Index();

                    await this.Send({
                        name_affix: PLAYER_PLACE_STAKE,
                        name_suffixes: [
                            player_index.toString(),
                        ],
                        data: {
                            player_index,
                            stake_index,
                            cell_index,
                        } as Player_Place_Stake_Data,
                        is_atomic: true,
                    });
                }

                arena.Enable_Input();
            }
        }
    }

    On_Life():
        Event.Listener_Info[]
    {
        const cell_index: Model.Cell_Index = this.Index();

        return ([
            {
                event_name: new Event.Name(AFTER, PLAYER_SELECT_STAKE),
                event_handler: this.After_Player_Select_Stake,
            },
            {
                event_name: new Event.Name(BEFORE, PLAYER_PLACE_STAKE),
                event_handler: this.Before_Player_Place_Stake,
            },
            {
                event_name: new Event.Name(ON, BOARD_CHANGE_CELL, cell_index.toString()),
                event_handler: this.On_Board_Change_This_Cell,
            },
        ]);
    }

    async After_Player_Select_Stake(
        {
        }: Player_Select_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (this.Board().Model().Is_Cell_Selectable(this.Index())) {
                // we only need to update the cursor for empty cells
                this.Change_Style(`cursor`, `pointer`);
            }
        }
    }

    async Before_Player_Place_Stake(
        {
            player_index,
            cell_index,
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (this.Model()().Is_Empty()) {
                // we only need to update the cursor for empty cells
                this.Change_Style(`cursor`, `default`);
            }
            if (this.Index() === cell_index) {
                this.current_color = this.Arena().Player(player_index).Model().Color();
            }
        }
    }

    async On_Board_Change_This_Cell(
        {
            turn_result,
        }: Board_Change_Cell_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Cell = this.Model()();

            if (turn_result.old_color != null) {
                const old_color: Model.Color = turn_result.old_color;
                const new_color: Model.Color = model.Color();
                const old_background_color: string =
                    `rgba(${old_color.Red()}, ${old_color.Green()}, ${old_color.Blue()}, ${old_color.Alpha()})`;
                const new_background_color: string =
                    `rgba(${new_color.Red()}, ${new_color.Green()}, ${new_color.Blue()}, ${new_color.Alpha()})`;

                let background_size: string = ``;
                let from_position: string = ``;
                let to_position: string = ``;
                let animation_name: string = ``;
                if (turn_result.direction === Model.Direction_e.LEFT) {
                    background_size = `1000% 100%`;
                    from_position = `left`;
                    to_position = `right`;
                    animation_name = `Board_Cell_Left_To_Right`;
                } else if (turn_result.direction === Model.Direction_e.TOP) {
                    background_size = `100% 1000%`;
                    from_position = `top`;
                    to_position = `bottom`;
                    animation_name = `Board_Cell_Top_To_Bottom`;
                } else if (turn_result.direction === Model.Direction_e.RIGHT) {
                    background_size = `1000% 100%`;
                    from_position = `right`;
                    to_position = `left`;
                    animation_name = `Board_Cell_Right_To_Left`;
                } else if (turn_result.direction === Model.Direction_e.BOTTOM) {
                    background_size = `100% 1000%`;
                    from_position = `bottom`;
                    to_position = `top`;
                    animation_name = `Board_Cell_Bottom_To_Top`;
                }

                const animation_duration: number =
                    Math.ceil(TURN_RESULT_WAIT_MILLISECONDS * TURN_RESULT_TRANSITION_RATIO);

                this.current_color = old_color;

                this.Change_Style(
                    `backgroundColor`,
                    old_background_color,
                );
                this.Change_Style(
                    `backgroundImage`,
                    `linear-gradient(to ${to_position}, ${old_background_color}, ${new_background_color})`,
                );
                this.Change_Style(
                    `backgroundSize`,
                    background_size,
                );
                this.Change_Style(
                    `backgroundPosition`,
                    from_position,
                )
                this.Change_Style(`animationName`, animation_name);
                this.Change_Style(`animationDuration`, `${animation_duration}ms`);
                this.Change_Style(`animationTimingFunction`, `ease-in-out`);
                this.Change_Style(`animationIterationCount`, `1`);
                this.Change_Style(`animationDirection`, `normal`);

                await Wait(animation_duration);
                if (this.Is_Alive()) {
                    this.current_color = new_color;

                    this.Change_Style(`backgroundColor`, new_background_color);
                    this.Change_Style(`backgroundImage`, ``);
                    this.Change_Style(`backgroundSize`, `100% 100%`);
                    this.Change_Style(`animationName`, ``);
                    this.Change_Style(`animationDuration`, ``);
                    this.Change_Style(`animationTimingFunction`, ``);
                    this.Change_Style(`animationIterationCount`, ``);
                    this.Change_Style(`animationDirection`, ``);

                    await Wait(200);
                    if (this.Is_Alive()) {
                        this.Change_Style(`animationName`, `Board_Cell_Flash`);
                        this.Change_Style(`animationDuration`, `${300}ms`);
                        this.Change_Style(`animationTimingFunction`, `ease-in`);
                        this.Change_Style(`animationIterationCount`, `1`);
                        this.Change_Style(`animationDirection`, `normal`);

                        await Wait(300);
                        if (this.Is_Alive()) {
                            this.Change_Style(`animationName`, ``);
                            this.Change_Style(`animationDuration`, ``);
                            this.Change_Style(`animationTimingFunction`, ``);
                            this.Change_Style(`animationIterationCount`, ``);
                            this.Change_Style(`animationDirection`, ``);

                            await Wait(TURN_RESULT_WAIT_MILLISECONDS);
                        }
                    }
                }
            } else {
                await this.Refresh();
                if (this.Is_Alive()) {
                    await Wait(TURN_RESULT_WAIT_MILLISECONDS);
                }
            }

            if (this.Is_Alive()) {
                if (
                    turn_result.combo ||
                    turn_result.same.left ||
                    turn_result.same.top ||
                    turn_result.same.right ||
                    turn_result.same.bottom ||
                    turn_result.plus.left ||
                    turn_result.plus.top ||
                    turn_result.plus.right ||
                    turn_result.plus.bottom
                ) {
                    this.popups = [];

                    if (turn_result.combo) {
                        this.popups.push(
                            <div
                                key={`center`}
                                className={`Board_Cell_Center`}
                                style={{
                                    display: `flex`,
                                    flexDirection: `column`,
                                    justifyContent: `center`,

                                    width: `100%`,
                                    height: `100%`,

                                    gridColumn: `2 / span 3`,
                                    gridRow: `3 / span 1`,
                                    alignSelf: `center`,
                                    justifySelf: `center`,
                                    zIndex: `1`,

                                    backgroundColor: `rgba(0, 0, 0, 0.5)`,

                                    borderRadius: `30%`,
                                }}
                            >
                                <div>COMBO</div>
                            </div>
                        );
                    }
                    for (const [class_name, key, has_same, has_plus, styles] of [
                        [
                            `Board_Cell_Left`,
                            `left`,
                            turn_result.same.left,
                            turn_result.plus.left,
                            {
                                display: `flex`,
                                flexDirection: `column`,
                                justifyContent: `center`,

                                width: `100%`,
                                height: `100%`,

                                gridColumn: `1 / span 1`,
                                gridRow: `3 / span 1`,
                                alignSelf: `center`,
                                justifySelf: `start`,
                                zIndex: `1`,

                                backgroundColor: `rgba(0, 0, 0, 0.5)`,

                                borderRadius: `50%`,
                            },
                        ],
                        [
                            `Board_Cell_Top`,
                            `top`,
                            turn_result.same.top,
                            turn_result.plus.top,
                            {
                                display: `flex`,
                                flexDirection: `column`,
                                justifyContent: `center`,

                                width: `100%`,
                                height: `100%`,

                                gridColumn: `3 / span 1`,
                                gridRow: `1 / span 1`,
                                alignSelf: `start`,
                                justifySelf: `center`,
                                zIndex: `1`,

                                backgroundColor: `rgba(0, 0, 0, 0.5)`,

                                borderRadius: `50%`,
                            },
                        ],
                        [
                            `Board_Cell_Right`,
                            `right`,
                            turn_result.same.right,
                            turn_result.plus.right,
                            {
                                display: `flex`,
                                flexDirection: `column`,
                                justifyContent: `center`,

                                width: `100%`,
                                height: `100%`,

                                gridColumn: `5 / span 1`,
                                gridRow: `3 / span 1`,
                                alignSelf: `center`,
                                justifySelf: `end`,
                                zIndex: `1`,

                                backgroundColor: `rgba(0, 0, 0, 0.5)`,

                                borderRadius: `50%`,
                            },
                        ],
                        [
                            `Board_Cell_Bottom`,
                            `bottom`,
                            turn_result.same.bottom,
                            turn_result.plus.bottom,
                            {
                                display: `flex`,
                                flexDirection: `column`,
                                justifyContent: `center`,

                                width: `100%`,
                                height: `100%`,

                                gridColumn: `3 / span 1`,
                                gridRow: `5 / span 1`,
                                alignSelf: `end`,
                                justifySelf: `center`,
                                zIndex: `1`,

                                backgroundColor: `rgba(0, 0, 0, 0.5)`,

                                borderRadius: `50%`,
                            },
                        ],
                    ] as Array<
                        [
                            string,
                            string,
                            boolean,
                            boolean,
                            any,
                        ]
                    >) {
                        if (has_same) {
                            if (has_plus) {
                                this.popups.push(
                                    <div
                                        key={key}
                                        className={class_name}
                                        style={styles}
                                    >
                                        <div>=</div>
                                        <div>+</div>
                                    </div>
                                );
                            } else {
                                this.popups.push(
                                    <div
                                        key={key}
                                        className={class_name}
                                        style={styles}
                                    >
                                        <div>=</div>
                                    </div>
                                );
                            }
                        } else if (has_plus) {
                            this.popups.push(
                                <div
                                    key={key}
                                    className={class_name}
                                    style={styles}
                                >
                                    <div>+</div>
                                </div>
                            );
                        }
                    }

                    await this.Refresh();
                    if (this.Is_Alive()) {
                        await Wait(TURN_RESULT_WAIT_MILLISECONDS);
                        if (this.Is_Alive()) {
                            this.popups = null;
                            await this.Refresh();
                        }
                    }
                }
            }
        }
    }
}

type Results_Props = {
    model: Model.Arena;
    parent: Arena;
    event_grid: Event.Grid;
}

class Results extends Component<Results_Props>
{
    private banner: Results_Banner | null = null;

    Arena():
        Arena
    {
        return this.Parent();
    }

    Banner():
        Results_Banner
    {
        if (this.banner == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.banner;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,

            backgroundColor: `rgba(0, 0, 0, 0.5)`,

            animationName: `Results_Fade_In`,
            animationDuration: `2000ms`,
            animationTimingFunction: `ease-in-out`,
            animationIterationCount: `1`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Arena = this.Model();
        const scores: Model.Scores | null = model.Scores();

        if (scores != null) {
            this.Change_Style(`zIndex`, `${this.Model().Rules().Selection_Card_Count()}`);

            return (
                <Results_Banner
                    key={`results_banner`}
                    ref={ref => this.banner = ref}

                    model={scores}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            );
        } else {
            return null;
        }
    }

    On_Life():
        Event.Listener_Info[]
    {
        return ([
            {
                event_name: new Event.Name(ON, GAME_START),
                event_handler: this.On_Game_Start,
            },
            {
                event_name: new Event.Name(ON, GAME_STOP),
                event_handler: this.On_Game_Stop,
            },
        ]);
    }

    async On_Game_Start(
        {
        }: Game_Start_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();
        }
    }

    async On_Game_Stop(
        {
            scores,
        }: Game_Stop_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();
        }
    }
}

type Results_Banner_Props = {
    model: Model.Scores;
    parent: Results;
    event_grid: Event.Grid;
}

class Results_Banner extends Component<Results_Banner_Props>
{
    private winner: Results_Winner | null = null;
    private draws: Results_Draws | null = null;

    Arena():
        Arena
    {
        return this.Results().Arena();
    }

    Results():
        Results
    {
        return this.Parent();
    }

    Winner():
        Results_Winner
    {
        if (this.winner == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.winner;
        }
    }

    Draws():
        Results_Draws
    {
        if (this.draws == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.draws;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `40vmin`,

            position: `absolute`,
            left: `0`,
            top: `calc(
                50% -
                (40vmin / 2) +
                (${this.Arena().CSS_Bumper_Height()} / 2)
            )`,

            borderWidth: `0.6vmin 0`,
            borderStyle: `solid`,
            borderColor: `#00000080`,

            animationName: `Results_Banner_Move_In`,
            animationDuration: `2000ms`,
            animationTimingFunction: `ease-in-out`,
            animationIterationCount: `1`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Scores = this.Model();

        if (model.Has_Winner()) {
            return (
                <div
                    className={`Results_Banner`}
                    style={this.Styles()}
                >
                    <Results_Winner
                        key={`results_winner`}
                        ref={ref => this.winner = ref}

                        model={model.Winner()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else {
            return (
                <div
                    className={`Results_Banner`}
                    style={this.Styles()}
                >
                    <Results_Draws
                        key={`results_draws`}
                        ref={ref => this.draws = ref}

                        model={model.Draws()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        }
    }
}

type Results_Winner_Props = {
    model: Model.Player_And_Score;
    parent: Results_Banner;
    event_grid: Event.Grid;
}

class Results_Winner extends Component<Results_Winner_Props>
{
    Arena():
        Arena
    {
        return this.Banner().Results().Arena();
    }

    Banner():
        Results_Banner
    {
        return this.Parent();
    }

    Before_Life():
        Component_Styles
    {
        const model: Model.Player_And_Score = this.Model();
        const color: Model.Color = model.player.Color();

        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `100%`,

            backgroundColor: `rgba(
                ${color.Red()},
                ${color.Green()},
                ${color.Blue()},
                ${color.Alpha()}
            )`,

            fontSize: `6vmin`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player_And_Score = this.Model();

        return (
            <div
                className={`Results_Winner`}
                style={this.Styles()}
            >
                <div>
                    {`${model.player.Name()} Wins!`}
                </div>
                <div>
                    {`Refresh the page to play again`}
                </div>
            </div>
        );
    }
}

type Results_Draws_Props = {
    model: Array<Model.Player_And_Score>;
    parent: Results_Banner;
    event_grid: Event.Grid;
}

class Results_Draws extends Component<Results_Draws_Props>
{
    Arena():
        Arena
    {
        return this.Banner().Results().Arena();
    }

    Banner():
        Results_Banner
    {
        return this.Parent();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `100%`,

            backgroundImage: ``,

            fontSize: `6vmin`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Array<Model.Player_And_Score> = this.Model();
        const color_stop_percent: number = 100 / model.length;
        const linear_gradient_colors: string = model.map(function (
            draw: Model.Player_And_Score,
            index: Model.Player_Index,
        ):
            string
        {
            const color: Model.Color = draw.player.Color();
            const color_stop: string = `${index * color_stop_percent}% ${(index + 1) * color_stop_percent}%`;

            return `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()}) ${color_stop}`;
        }).join(`, `);

        this.Change_Style(
            `backgroundImage`,
            `linear-gradient(to right, ${linear_gradient_colors})`,
        );

        return (
            <div
                className={`Results_Draws`}
                style={this.Styles()}
            >
                <div>
                    {`Draw`}
                </div>
                <div>
                    {`Refresh the page to play again`}
                </div>
            </div>
        );
    }
}
