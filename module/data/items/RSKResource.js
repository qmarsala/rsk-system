import { fields, costField } from "./fields.js"

export default class RSKResource extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            description: new fields.StringField(),
            uses: new fields.StringField(),
            cost: new fields.NumberField({ ...costField })
        }
    }
}