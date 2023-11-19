import RSKItem from "./documents/RSKItem.js";

import RSKItemSheet from "./sheets/RSKItemSheet.js";
import RSKActorSheet from "./sheets/RSKActorSheet.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [];
    return loadTemplates(templatePaths);
}

Hooks.once("init", function () {
    console.log("initializing...");
    game.rsk = {
        RSKItem
    }

    CONFIG.Item.documentClass = RSKItem;

    Items.unregisterSheet("core", ItemSheet)
    Items.registerSheet("rsk", RSKItemSheet, { makeDefault: true })

    Actors.unregisterSheet("core", ActorSheet)
    Actors.registerSheet("rsk", RSKActorSheet, { makeDefault: true })

    console.log("rsk ready");
});