import RSKRollDialog from "./applications/RSKRollDialog.js";

export default class RSKDice {
    // not sure how I feel about this part
    static addButtonListener = (html, handler) => {
        html.find('.roll-dice').click(async (ev) => {
            const rollMode = $(ev.currentTarget).data("rollMode");
            const rollResult = await RSKDice.basicRoll();
            await handler(rollResult, rollMode);
        });
    }

    static addClickListener = (selector, handler) => {
        selector.click(async (ev) => {
            const rollResult = await RSKDice.basicRoll();
            await handler(rollResult);
        });
    }

    static handlePlayerRoll = () => async (rollResult, rollMode) => {
        // is this even the right spot to set up the dialog?
        const rollDialogClosed = new Promise((resolve) => {
            new RSKRollDialog(resolve, {}).render(true);
        });
        const result = await rollDialogClosed;

        if (result.rolled) {
            const rollTotal = Number(rollResult.total);
            const testNumber = Number(result.testNumber);
            const isSuccess = rollTotal <= testNumber;
            const margin = testNumber - rollTotal;
            const flavor = `${rollResult.isCritical ? "critical" : ""} ${isSuccess ? "success" : "fail"} (${margin})`
            const cfg = rollMode ? { rollMode } : {};
            await rollResult.toMessage({ flavor }, cfg);
        }
    }

    static handleBasicRoll = () => async (rollResult, rollMode) => {
        const flavor = `${rollResult.isCritical ? "critical" : ""}`
        const cfg = rollMode ? { rollMode } : {};
        await rollResult.toMessage({ flavor }, cfg);
    }

    static basicRoll = async () => {
        let r = Roll.create(`3d6`);
        const result = await r.evaluate();
        const results = result.terms[0].results;
        const isCritical = results.every(v => v.result === results[0].result);
        return { isCritical, total: result.result, results, toMessage: (opt, cfg) => r.toMessage(opt, cfg) }
    }
}
