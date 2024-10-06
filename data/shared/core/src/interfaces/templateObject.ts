import { isObjectId, NonFunctionProperties, ObjectId, toObjectId } from "../utils";

export interface TemplateObjectRaw {
    _id?: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export type NonTemplateObjectFunctions<T extends TemplateObject> = Omit<NonFunctionProperties<T>, "createdAt" | "updatedAt">;

export default abstract class TemplateObject implements TemplateObjectRaw {
    public _id?: ObjectId;

    private _createdAt?: Date;
    private _updatedAt?: Date;

    constructor(obj: NonFunctionProperties<TemplateObjectRaw>) {
        if (obj._id) {
            this._id = toObjectId(obj._id);
        }
        this._createdAt = obj.createdAt;
        this._updatedAt = obj.updatedAt;

        this._objectValidation();
    }

    public get createdAt(): Date | undefined {
        return this._createdAt;
    }

    public get updatedAt(): Date | undefined {
        return this._updatedAt;
    }

    private _objectValidation() {
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

    protected abstract _validation(): void | never;
}
