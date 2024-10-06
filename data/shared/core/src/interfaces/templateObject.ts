import { NonFunctionProperties } from "../utils";

export interface TemplateObjectRaw {
    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type NonTemplateObjectFunctions<T extends TemplateObject> = Omit<NonFunctionProperties<T>, "createdAt" | "updatedAt">;

export default abstract class TemplateObject implements TemplateObjectRaw {
    public _id?: string;

    private _createdAt?: string;
    private _updatedAt?: string;

    constructor(obj: NonFunctionProperties<TemplateObjectRaw>) {
        if (obj._id) {
            this._id = obj._id.toString();
        }
        this._createdAt = obj.createdAt?.toISOString() || (obj as TemplateObject)._createdAt;
        this._updatedAt = obj.updatedAt?.toISOString() || (obj as TemplateObject)._updatedAt;

        this._objectValidation();
    }

    public get createdAt(): Date | undefined {
        if (this._createdAt) {
            return new Date(this._createdAt);
        }
        return undefined;
    }

    public get updatedAt(): Date | undefined {
        if (this._updatedAt) {
            return new Date(this._updatedAt);
        }
        return undefined;
    }

    private _objectValidation() {
        if (this._id && typeof this._id !== "string") {
            throw new Error("Invalid id");
        }
        if ((this._createdAt && typeof this._createdAt !== "string") || (this.createdAt && this.createdAt.getTime() > Date.now())) {
            throw new Error("Invalid createdAt");
        }
        if ((this._updatedAt && typeof this._updatedAt !== "string") || (this.updatedAt && this.updatedAt.getTime() > Date.now())) {
            throw new Error("Invalid updatedAt");
        }
    }

    protected abstract _validation(): void | never;
}
