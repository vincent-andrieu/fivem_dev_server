import Player from "./interfaces/player";
import TemplateObject, { NonTemplateObjectFunctions } from "./interfaces/templateObject";
import { ObjectId, isObjectId, toObjectId } from "./utils";

export { Player, TemplateObject, isObjectId, toObjectId };

export type { NonTemplateObjectFunctions, ObjectId };
