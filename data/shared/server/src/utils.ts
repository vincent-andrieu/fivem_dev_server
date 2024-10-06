import { NonTemplateObjectFunctions, TemplateObject } from "@shared/core";

export type ObjectConstructor<T extends TemplateObject> = { new (model: NonTemplateObjectFunctions<T>): T };
