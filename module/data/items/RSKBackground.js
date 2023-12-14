export default class RSKBackground extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const numberField = { integer: true, initial: 0, min: 0, max: 10 };
        return {
            description: new fields.StringField(),
            skillImprovements: new fields.SchemaField(Object.keys(CONFIG.RSK.skills).reduce((obj, skill) => {
                obj[skill] = new fields.NumberField({ ...numberField });
                return obj;
            }, {}))
        }
    };
}