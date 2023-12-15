import RSKActor from "./RSKActor.js";

export default class RSKCharacter extends RSKActor {
    //todo: do we need this type of validation here anymore if its in the datamodel?
    minSkillLevel = 1;
    maxSkillLevel = 10;

    _clampActorValues() {
        super._clampActorValues();
        for (let skill in this.system.skills) {
            this.system.skills[skill].level = game.rsk.math.clamp_value(
                this.system.skills[skill].level,
                { min: this.minSkillLevel, max: this.maxSkillLevel });
        }
    }

    prepareBaseData() {
        super.prepareBaseData();

        const systemData = this.system;
        systemData.lifePoints.max =
            Object.keys(systemData.abilities).map(i => systemData.abilities[i]).reduce((acc, a, i) => acc += Number(a), 0)
            + Object.keys(systemData.skills).map(i => systemData.skills[i]).reduce((acc, s, i) => acc += Number(s.level), 0);

        systemData.prayerPoints.max = systemData.skills.prayer.level * 3;
        systemData.prayerPoints.value = game.rsk.math.clamp_value(systemData.prayerPoints.value, systemData.prayerPoints)
        systemData.summoningPoints.max = systemData.skills.summoning.level * 5;
        systemData.summoningPoints.value = game.rsk.math.clamp_value(systemData.summoningPoints.value, systemData.summoningPoints)
    }

    getRollData() {
        const systemData = this.system.toObject();
        return {
            skills: { ...systemData.skills },
            abilities: { ...systemData.abilities },
            calculateTestNumber: (skill, ability) => this.calculateTestNumber(skill, ability)
        };
    }

    calculateTestNumber(skill, ability) {
        return this.system.skills[skill].level
            + (this.system.skills[skill].modifier ?? 0)
            + this.system.abilities[ability];
    }

    increaseSkillLevel(skill, amount) {
        //todo: if this is now >= 5 award ability level
        this.updateSkillLevel(skill, this.system.skills[skill].level + amount);
    }

    decreaseSkillLevel(skill, amount) {
        this.updateSkillLevel(skill, this.system.skills[skill].level - amount);
    }

    updateSkillLevel(skill, newLevel) {
        const newSkillLevel = game.rsk.math.clamp_value(newLevel, { min: this.minSkillLevel, max: this.maxSkillLevel });
        this.update({ [`system.skills.${skill}.level`]: newSkillLevel });
    }

    useSkill(skill) {
        if (this.system.skills && this.system.skills.hasOwnProperty(skill)) {
            this.update({ [`system.skills.${skill}.used`]: true });
        }
    }

    //temp: will change when tanner is done with inventory
    equip(item) {
        const currentEquipped = this.items.filter(i => i.isEquipped
            && i.inSlot === item.inSlot);
        if (currentEquipped.length > 0 && currentEquipped[0] !== item) {
            currentEquipped[0].equip();
        }
        item.equip();
    }

    // todo: armour soak may be good to put in 
    // one of the prepare data methods and displayed somewhere on the char
    // sheet, to give feedback about the current soak values based on 
    // the current character/equipment.
    _getArmourSoakValue() {
        return this.items
            .filter(i => i.isEquipped)
            .reduce((acc, w, i) => acc +=
                typeof w.getArmourValue === "function" ? w.getArmourValue() : 0, 0)
    }

    applyBackgrounds() {
        this.items.filter(i => i.type === "background")
            .map(b => b.applyBackgroundSkillImprovements(this))
    }
}