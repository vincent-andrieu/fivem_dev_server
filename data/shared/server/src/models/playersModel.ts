import { Player } from "@shared/core";
import playersSchema from "../schemas/playerSchema";
import TemplateModel from "./templateModel";

export default class PlayersModel extends TemplateModel<Player> {
    constructor() {
        super(Player, "players", playersSchema);
    }

    public async getPlayerBySource(source: string): Promise<Player> {
        const identifierType = "license";
        const rawIdentifier = GetPlayerIdentifierByType(source, identifierType);
        const identifier = rawIdentifier.split(":")[1];

        if (!identifier) {
            throw new Error("Identifier not found");
        }
        const player = await this._model.findOne({ ["identifiers." + identifierType]: identifier });

        if (!player) {
            throw "Player not found";
        }
        return new this._ctor(player.toObject<Player>());
    }
}
