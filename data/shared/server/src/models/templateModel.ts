import mongoose from "mongoose";

import { NonTemplateObjectFunctions, TemplateObject } from "@shared/core";
import { ObjectConstructor, ObjectId, toObjectId } from "../utils";

export default abstract class TemplateModel<T extends TemplateObject> {
    protected _model: mongoose.Model<mongoose.Model<T>>;

    constructor(
        protected _ctor: ObjectConstructor<T>,
        collectionName: string,
        schema: mongoose.Schema
    ) {
        this._model = mongoose.model<mongoose.Model<T>>(collectionName, schema);
    }

    public async add(obj: NonTemplateObjectFunctions<T>): Promise<T> {
        const result = await this._model.create(obj);

        return new this._ctor(result.toObject<T>());
    }

    public async get(id: Array<ObjectId | string>, projection?: string, populate?: string): Promise<Array<T>>;
    public async get(id: ObjectId | string, projection?: string, populate?: string): Promise<T>;
    public async get(id: Array<ObjectId | string> | ObjectId | string, projection?: string, populate?: string): Promise<Array<T> | T | never> {
        if (Array.isArray(id)) {
            const query = this._model.find({ _id: { $in: id.map((elem) => toObjectId(elem)) } }, projection);

            if (populate) {
                query.populate(populate);
            }
            const result = await query;
            if (result.length !== id.length) {
                throw new Error("TemplateSchema.get(Array) Not found");
            }
            return result.map((obj) => new this._ctor(obj.toObject<T>()));
        } else {
            const query = this._model.findById(toObjectId(id), projection);

            if (populate) {
                query.populate(populate);
            }
            const result = await query;
            if (!result) {
                throw new Error("TemplateSchema.get(string) Not found");
            }
            return new this._ctor(result.toObject<T>());
        }
    }

    public async exist(id: Array<ObjectId | string>): Promise<boolean>;
    public async exist(id: ObjectId | string): Promise<boolean>;
    public async exist(id: Array<ObjectId | string> | ObjectId | string): Promise<boolean> {
        if (Array.isArray(id)) {
            const result = await this._model.countDocuments({ _id: { $in: id.map((elem) => toObjectId(elem)) } });

            return result === id.length;
        } else {
            const result = await this._model.exists({ _id: toObjectId(id) });

            return !!result;
        }
    }

    public async update(obj: T) {
        if (!obj._id) {
            throw new Error("TemplateSchema.update(obj) Invalid ID");
        }
        return this.updateById(obj._id, obj);
    }
    public async updateById(id: ObjectId | string, obj: Omit<T, keyof TemplateObject>, fields = ""): Promise<T | never> {
        const result = await this._model.findByIdAndUpdate(toObjectId(id), this._parseFieldsSelector(fields, obj), { new: true });

        if (!result) {
            throw new Error("TemplateSchema.updateById(id, obj) Not found");
        }
        return new this._ctor(result.toObject<T>());
    }

    public async delete(id: Array<ObjectId | string> | ObjectId | string): Promise<void | never> {
        if (Array.isArray(id)) {
            const result = await this._model.deleteMany({ _id: { $in: id.map((elem) => toObjectId(elem)) } });

            if (result.deletedCount !== id.length) {
                throw new Error("TemplateSchema.delete(Array) Not found");
            }
        } else {
            const result = await this._model.deleteOne({ _id: toObjectId(id) });

            if (result.deletedCount !== 1) {
                throw new Error("TemplateSchema.delete(string) Not found");
            }
        }
    }

    protected _parseFieldsSelector(fields: string, obj: Record<string, unknown>): Record<string, unknown> {
        if (fields.length === 0) {
            return obj;
        }
        let result = {};

        for (const field of fields.split(" ")) {
            result = {
                ...result,
                ...this._parseConcatenateField(field, obj)
            };
        }

        return result;
    }

    private _parseConcatenateField<Target extends Record<string, unknown>, Source extends Record<string, unknown>>(field: string, obj: Source): Target {
        const result = {} as Target;

        if (field.includes(".")) {
            const fields = field.split(".");
            const parent = fields.shift();

            if (!parent || !obj[parent]) {
                throw new Error("TemplateSchema._parseConcatenateField Invalid field");
            }

            (result as any)[parent] = this._parseConcatenateField(fields.join("."), obj[parent] as Record<string, unknown>);
        } else {
            (result as any)[field] = obj[field];
        }

        return result;
    }
}
