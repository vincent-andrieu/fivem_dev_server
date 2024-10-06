import Player, { PlayerIdentifiers } from "./interfaces/player";
import TemplateObject, { NonTemplateObjectFunctions } from "./interfaces/templateObject";
import { Color, Coords, ObjectId, Position, isObjectId, toObjectId } from "./utils";

export { Player, TemplateObject, isObjectId, toObjectId };

export type { Color, Coords, NonTemplateObjectFunctions, ObjectId, PlayerIdentifiers, Position };
