import { rskStatusEffects, statusToEffect } from "../../effects/statuses.js";

export default class RSKActor extends Actor {
  get isDead() {
    return this.system.lifePoints.value < 1;
  }

  get isAlive() {
    return this.system.lifePoints.value > 0;
  }

  prepareData() {
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
    this._clampActorValues();
  }

  //todo: do we need this type of validation here anymore if its in the datamodel?
  _clampActorValues() {
    this.system.lifePoints.value = game.rsk.math.clamp_value(this.system.lifePoints.value, this.system.lifePoints);
  }

  // rename this to apply outcome?
  // - damage by type: slash, stab, crush, air, fire, poison, etc...
  async receiveDamage(damageEntry) { return await applyOutcome(damageEntry); }
  async applyOutcome(outcome) {
    //todo: how to communicate damage by type, and the puncture assotiated with the outcome
    // potentially a weakness to air could be implemented by adding 2 puncture to air attacks?
    const puncture = Object.keys(outcome.damageEntries).reduce((punctureAmount, damageType) =>
      damageType === "something were weak too"
        ? punctureAmount + 0 // + amount were weak to it
        : punctureAmount, Number(outcome.puncture));
    const damageAfterSoak = this._applyArmourSoak(damageAmount, puncture);
    const damageAfterSoakAndModifiers = this._applyIncomingDamageModifiers(damageAfterSoak);
    let remainingLifePoints = { ...this.system.lifePoints };
    remainingLifePoints.value = game.rsk.math.clamp_value(
      this.system.lifePoints.value - damageAfterSoakAndModifiers,
      { min: 0 });
    if (remainingLifePoints.value < 1 && !this.statuses.has("dead")) {
      const death = rskStatusEffects.find(x => x.id === "dead");
      await this.createEmbeddedDocuments("ActiveEffect", [statusToEffect(death)]);
    }
    this.update({ "system.lifePoints": remainingLifePoints });
  }

  _applyIncomingDamageModifiers(damage) {
    //todo: apply modifiers
    return damage;
  }

  _applyArmourSoak(damage, puncture = 0) {
    let armourValue = this._getArmourSoakValue();
    const applicablePuncture = game.rsk.math.clamp_value(puncture, { min: 0, max: armourValue });
    return game.rsk.math.clamp_value(damage - applicablePuncture, { min: 0 });
  }

  // todo: these two methods for calculating armour soak may be good to put in 
  // one of the prepare data methods and displayed somewhere on the char
  // sheet, to give feedback about the current soak values based on 
  // the current character/equipment.
  _getArmourSoakValue = () => 0;
}