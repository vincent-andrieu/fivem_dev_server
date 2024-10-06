import { Player } from "@shared/core";
import playersSchema from "../schemas/playerSchema";
import TemplateModel from "./templateModel";

export default class PlayersModel extends TemplateModel<Player> {
    constructor() {
        super(Player, "players", playersSchema);
    }
}
