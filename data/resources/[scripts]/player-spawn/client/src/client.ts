import { Player } from "@shared/core";

onNet("player-spawn:init", (player: Player) => {
    console.log("player-spawn", player, PlayerId());
});
