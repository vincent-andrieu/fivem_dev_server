import { NonFunctionProperties, ObjectId } from "../utils";
export interface TemplateObjectRaw {
    _id?: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
export type NonTemplateObjectFunctions<T extends TemplateObject> = Omit<NonFunctionProperties<T>, "createdAt" | "updatedAt">;
export default abstract class TemplateObject implements TemplateObjectRaw {
    _id?: ObjectId;
    private _createdAt?;
    private _updatedAt?;
    constructor(obj: NonFunctionProperties<TemplateObjectRaw>);
    get createdAt(): Date | undefined;
    get updatedAt(): Date | undefined;
    private _objectValidation;
    protected abstract _validation(): void | never;
}
