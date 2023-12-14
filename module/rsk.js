import RSKItem from "./documents/RSKItem.js";
import RSKActor from "./documents/RSKActor.js";

import RSKItemSheet from "./sheets/RSKItemSheet.js";
import RSKActorSheet from "./sheets/RSKActorSheet.js";

import RSK from "./config.js";
import RSKDice from "./rsk-dice.js";
import RSKConfirmRollDialog from "./applications/RSKConfirmRollDialog.js";
import RSKActiveEffect from "./documents/RSKActiveEffect.js";
import RSKQuality from "./data/RSKQuality.js";
import RSKQualitySheet from "./sheets/RSKQualitySheet.js";
import RSKAction from "./data/RSKAction.js";
import RSKSpecialFeature from "./data/RSKSpecialFeature.js";
import RSKCape from "./data/RSKCape.js";
import RSKMaterial from "./data/RSKMaterial.js";
import RSKResource from "./data/RSKResource.js";
import RSKArmour from "./data/RSKArmour.js";

globalThis.rsk = {
    config: RSK,
};

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "/systems/rsk/templates/items/parts/edit-damage-entries.hbs",
        "/systems/rsk/templates/items/parts/view-damage-entries.hbs",
        "/systems/rsk/templates/items/parts/edit-range.hbs",
        "/systems/rsk/templates/items/parts/view-range.hbs",

        "/systems/rsk/templates/actors/parts/view-items.hbs",
        "/systems/rsk/templates/actors/parts/edit-items.hbs",

        "/systems/rsk/templates/parts/view-effects.hbs",
        "/systems/rsk/templates/parts/edit-effects.hbs"
    ];
    return loadTemplates(templatePaths);
}

Hooks.once("init", function () {
    console.log("initializing...");
    game.rsk = {
        RSKItem,
        RSKActor
    };

    CONFIG.RSK = RSK;
    CONFIG.Actor.documentClass = RSKActor;
    CONFIG.Item.documentClass = RSKItem;
    CONFIG.Item.dataModels = {
        quality: RSKQuality,
        action: RSKAction,
        specialFeature: RSKSpecialFeature,
        cape: RSKCape,
        material: RSKMaterial,
        resource: RSKResource,
        armour: RSKArmour
    };
    CONFIG.ActiveEffect.documentClass = RSKActiveEffect;

    Items.unregisterSheet("core", ItemSheet)
    Items.registerSheet("rsk", RSKItemSheet, { makeDefault: true })
    Items.registerSheet("rsk", RSKQualitySheet, { types: ["quality"], makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet)
    Actors.registerSheet("rsk", RSKActorSheet, { makeDefault: true })

    preloadHandlebarsTemplates()
    console.log("rsk ready");
});

Hooks.once("renderActorSheet", function (sheet, html, data) {
    sheet.activateTab(data.actor.type === "character"
        ? "skills"
        : "description");
});

Hooks.once("ready", function () {
    RSKDice.addClickListener($("i.fa-dice-d20"), async (ev) => {
        const currentCharacter = game.users?.current?.character;
        if (currentCharacter) {
            const rollData = currentCharacter.getRollData();
            const dialog = RSKConfirmRollDialog.create(rollData, options)
            const rollOptions = await dialog();
            RSKDice.handlePlayerRoll(rollOptions);
        } else {
            RSKDice.handleBasicRoll();
        }
    });
});