// 1. Dessiner une zone au sol
// 2. Quand on s'en rapproche dans une voiture, afficher un message
// 3. Quand on click sur E, supprimer le véhicule

import { Color, Coords } from "core";

const POS_COORDS: Coords = [0, 0, 70];
const POS_SIZE = 5;

setTick(() => {
    const playerPed = PlayerPedId();

    if (IsPedInAnyVehicle(playerPed, false)) {
        const playerPos = GetEntityCoords(playerPed, true);
        const distance = GetDistanceBetweenCoords(playerPos[0], playerPos[1], playerPos[2], POS_COORDS[0], POS_COORDS[1], POS_COORDS[2], false);

        if (distance < POS_SIZE + 20) {
            myDrawMarker(POS_COORDS, POS_SIZE);
            if (distance < POS_SIZE) {
                SetTextComponentFormat("STRING");
                AddTextComponentString("Appuyez sur ~INPUT_CONTEXT~ pour supprimer le véhicule");
                DisplayHelpTextFromStringLabel(0, false, true, -1);

                if (IsControlJustPressed(0, 38)) {
                    DeleteEntity(GetVehiclePedIsIn(playerPed, false));
                }
            }
        }
    }
});

function myDrawMarker(coords: Coords, size: number, type: number = 23, color: Color = [255, 0, 255, 100]) {
    DrawMarker(type, coords[0], coords[1], coords[2], 0, 0, 0, 0, 0, 0, size, size, 1, color[0], color[1], color[2], color[3], false, true, 2, false, null, null, false);
}
