import { isObjectId, toObjectId } from "../utils";
export default class TemplateObject {
    _id;
    _createdAt;
    _updatedAt;
    constructor(obj) {
        if (obj._id) {
            this._id = toObjectId(obj._id);
        }
        this._createdAt = obj.createdAt;
        this._updatedAt = obj.updatedAt;
        this._objectValidation();
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    _objectValidation() {
        if (this._id && !isObjectId(this._id)) {
            throw new Error("Invalid id");
        }
        if (this._createdAt && (!(this._createdAt instanceof Date) || this._createdAt.getTime() > Date.now())) {
            throw new Error("Invalid createdAt");
        }
        if (this._updatedAt && (!(this._updatedAt instanceof Date) || this._updatedAt.getTime() > Date.now())) {
            throw new Error("Invalid updatedAt");
        }
    }
}
