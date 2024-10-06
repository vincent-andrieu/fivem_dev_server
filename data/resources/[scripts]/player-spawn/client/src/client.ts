import { nonBlockingWait, Player } from "@shared/core";

const pedModel = "a_m_y_skater_01";
const pedSwitchHash = -835930287;
const switchCoords = { x: -75.0, y: -820.0, z: 500.0 };

onNet("player-spawn:init", async (player: Player) => {
    displayHUD(false);
    const fadingTransition = fadeTransition();

    showBusySpinner("Creating camera");
    const cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);
    SetCamActive(cam, true);
    RenderScriptCams(true, true, 500, true, true);
    SetCamRot(cam, -90.0, 0.0, 0.0, 2);
    SetCamCoord(cam, switchCoords.x, switchCoords.y, switchCoords.z + 1000);
    SetCamFov(cam, 110.0);
    SetEntityHeading(GetPlayerPed(-1), 0.0);

    showBusySpinner("Loading player");
    const playerId = PlayerId();
    freezePlayer(playerId, true);

    RequestModel(pedModel);
    RequestCollisionAtCoord(player.position.x, player.position.y, player.position.z);
    RequestModel(pedSwitchHash);
    NetworkResurrectLocalPlayer(player.position.x, player.position.y, player.position.z, player.position.heading, 1000, true);

    await nonBlockingWait(() => !HasModelLoaded(pedModel), 50);
    SetPlayerModel(playerId, pedModel);
    SetModelAsNoLongerNeeded(pedModel);

    const ped = PlayerPedId();
    SetEntityCoordsNoOffset(ped, player.position.x, player.position.y, player.position.z, false, false, true);
    SetEntityHeading(ped, player.position.heading);
    ClearPedTasksImmediately(ped);
    RemoveAllPedWeapons(ped, false);
    ClearPlayerWantedLevel(playerId);

    BusyspinnerOff();
    await fadingTransition;
    showBusySpinner("Loading terrain");
    await nonBlockingWait(() => !HasCollisionLoadedAroundEntity(ped), 100);
    await playerSwitch(player, cam);
});

function freezePlayer(playerId: number, toggle: boolean) {
    const ped = GetPlayerPed(-1);

    SetEntityCollision(ped, !toggle, !toggle);
    FreezeEntityPosition(ped, toggle);
    SetEntityVisible(ped, !toggle, false);
    SetPlayerControl(playerId, !toggle, 0);
    SetPlayerInvincible(playerId, toggle);
}

async function playerSwitch(player: Player, cam: number) {
    showBusySpinner("Loading player switch");
    await nonBlockingWait(() => !HasModelLoaded(pedSwitchHash), 100);
    const pedSwitch = CreatePed(1, pedSwitchHash, switchCoords.x, switchCoords.y, switchCoords.z, 0, false, true);
    SetEntityAsMissionEntity(pedSwitch, false, true);
    SetEntityVisible(pedSwitch, false, false);
    FreezeEntityPosition(pedSwitch, true);
    SetModelAsNoLongerNeeded(pedSwitchHash);
    BusyspinnerOff();

    StartPlayerSwitch(
        pedSwitch,
        GetPlayerPed(-1),
        0,
        GetIdealPlayerSwitchType(switchCoords.x, switchCoords.y, switchCoords.z, player.position.x, player.position.y, player.position.z)
    );

    await new Promise((resolve) => setTimeout(resolve, 4000));
    RenderScriptCams(false, true, 0, true, false); // Maybe the ease to true
    DestroyCam(cam, false);
    freezePlayer(PlayerId(), false);

    await nonBlockingWait(() => IsPlayerSwitchInProgress(), 100);
    SetEntityAsNoLongerNeeded(pedSwitch);
    DeleteEntity(pedSwitch);

    displayHUD(true);
}

async function fadeTransition() {
    DoScreenFadeOut(500);
    await nonBlockingWait(() => IsScreenFadingOut(), 50);

    ShutdownLoadingScreen();
    DoScreenFadeIn(3000);

    await nonBlockingWait(() => IsScreenFadingIn(), 500);
}

function showBusySpinner(message: string) {
    BeginTextCommandBusyspinnerOn("STRING");
    AddTextComponentSubstringPlayerName(message);
    EndTextCommandBusyspinnerOn(0);
}

function displayHUD(toggle: boolean) {
    DisplayRadar(toggle);
    DisplayHud(toggle);
}
