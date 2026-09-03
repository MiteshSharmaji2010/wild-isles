// ============================================================
// WILD ISLES
// public/js/survival.js
// SURVIVAL SYSTEM v1.0
// ============================================================

export class SurvivalSystem {

    constructor(player, terrain) {

        this.player = player;
        this.terrain = terrain;

        // ====================================================
        // MAX VALUES
        // ====================================================

        this.maxHealth = 100;
        this.maxStamina = 100;
        this.maxHunger = 100;
        this.maxThirst = 100;
        this.maxTemperature = 100;
        this.maxFatigue = 100;

        // ====================================================
        // CURRENT VALUES
        // ====================================================

        this.health = 100;
        this.stamina = 100;
        this.hunger = 100;
        this.thirst = 100;

        // 50 = comfortable
        this.temperature = 50;

        // 0 = rested
        this.fatigue = 0;

        // ====================================================
        // TIMERS
        // ====================================================

        this.survivalTimer = 0;

        this.damageTimer = 0;

        this.recoveryTimer = 0;

        // ====================================================
        // SETTINGS
        // ====================================================

        this.hungerDrain = 0.08;

        this.thirstDrain = 0.13;

        this.fatigueRate = 0.035;

        this.healthRecovery = 0.35;

        this.starvationDamage = 2.0;

        this.dehydrationDamage = 3.0;

        this.temperatureDamage = 1.5;

        // ====================================================
        // STATE
        // ====================================================

        this.isStarving = false;

        this.isDehydrated = false;

        this.isCold = false;

        this.isHot = false;

        this.isExhausted = false;

        this.isDead = false;

        console.log("Survival System v1.0 READY");
    }


    // ========================================================
    // UPDATE
    // ========================================================

    update(deltaTime, elapsedTime = 0) {

        if (this.isDead) {
            return;
        }

        if (!Number.isFinite(deltaTime)) {
            deltaTime = 0.016;
        }

        deltaTime = Math.min(deltaTime, 0.1);

        // ====================================================
        // BASIC SURVIVAL DRAIN
        // ====================================================

        this.hunger -=
            this.hungerDrain *
            deltaTime;

        this.thirst -=
            this.thirstDrain *
            deltaTime;


        // ====================================================
        // RUNNING / FATIGUE
        // ====================================================

        const running =
            this.player &&
            this.player.isRunning;

        if (running) {

            this.fatigue +=
                this.fatigueRate *
                2.5 *
                deltaTime;

        } else {

            this.fatigue -=
                this.fatigueRate *
                deltaTime;
        }


        // ====================================================
        // TEMPERATURE
        // ====================================================

        this.updateTemperature(
            deltaTime,
            elapsedTime
        );


        // ====================================================
        // STATUS
        // ====================================================

        this.hunger =
            this.clamp(
                this.hunger,
                0,
                this.maxHunger
            );

        this.thirst =
            this.clamp(
                this.thirst,
                0,
                this.maxThirst
            );

        this.fatigue =
            this.clamp(
                this.fatigue,
                0,
                this.maxFatigue
            );


        // ====================================================
        // CONDITION FLAGS
        // ====================================================

        this.isStarving =
            this.hunger <= 0;

        this.isDehydrated =
            this.thirst <= 0;

        this.isExhausted =
            this.fatigue >= 100;

        this.isCold =
            this.temperature <= 20;

        this.isHot =
            this.temperature >= 80;


        // ====================================================
        // SURVIVAL DAMAGE
        // ====================================================

        this.damageTimer += deltaTime;

        if (this.damageTimer >= 1) {

            this.damageTimer = 0;

            if (this.isStarving) {

                this.damageHealth(
                    this.starvationDamage
                );
            }

            if (this.isDehydrated) {

                this.damageHealth(
                    this.dehydrationDamage
                );
            }

            if (
                this.isCold ||
                this.isHot
            ) {

                this.damageHealth(
                    this.temperatureDamage
                );
            }
        }


        // ====================================================
        // NATURAL HEALTH RECOVERY
        // ====================================================

        this.recoveryTimer += deltaTime;

        if (
            this.recoveryTimer >= 2 &&
            this.hunger > 50 &&
            this.thirst > 50 &&
            !this.isCold &&
            !this.isHot &&
            !this.isStarving &&
            !this.isDehydrated
        ) {

            this.recoveryTimer = 0;

            this.heal(
                this.healthRecovery
            );
        }


        // ====================================================
        // APPLY PLAYER VALUES
        // ====================================================

        this.applyToPlayer();


        // ====================================================
        // DEATH
        // ====================================================

        if (this.health <= 0) {

            this.health = 0;

            this.isDead = true;

            this.handleDeath();
        }
    }


    // ========================================================
    // TEMPERATURE
    // ========================================================

    updateTemperature(
        deltaTime,
        elapsedTime
    ) {

        let targetTemperature = 50;


        // ====================================================
        // DAY / NIGHT EFFECT
        // ====================================================

        const dayCycle =
            elapsedTime % 120;

        const normalized =
            dayCycle / 120;


        if (
            normalized > 0.25 &&
            normalized < 0.70
        ) {

            targetTemperature += 8;

        } else {

            targetTemperature -= 8;
        }


        // ====================================================
        // TERRAIN / BIOME
        // ====================================================

        if (
            this.player &&
            this.terrain
        ) {

            const position =
                this.player.getPosition();


            if (
                typeof this.terrain.getBiome ===
                "function"
            ) {

                const biome =
                    this.terrain.getBiome(
                        position.x,
                        position.z
                    );


                if (
                    biome === "desert"
                ) {

                    targetTemperature += 25;
                }


                if (
                    biome === "mountain"
                ) {

                    targetTemperature -= 25;
                }


                if (
                    biome === "snow"
                ) {

                    targetTemperature -= 35;
                }


                if (
                    biome === "forest"
                ) {

                    targetTemperature -= 5;
                }
            }
        }


        // ====================================================
        // SMOOTH TEMPERATURE
        // ====================================================

        this.temperature +=
            (
                targetTemperature -
                this.temperature
            ) *
            deltaTime *
            0.15;


        this.temperature =
            this.clamp(
                this.temperature,
                0,
                100
            );
    }


    // ========================================================
    // DAMAGE
    // ========================================================

    damageHealth(amount) {

        if (this.isDead) {
            return;
        }

        amount =
            Math.max(
                0,
                Number(amount) || 0
            );

        this.health -= amount;

        this.health =
            this.clamp(
                this.health,
                0,
                this.maxHealth
            );

        this.applyToPlayer();
    }


    // ========================================================
    // HEAL
    // ========================================================

    heal(amount) {

        if (this.isDead) {
            return;
        }

        amount =
            Math.max(
                0,
                Number(amount) || 0
            );

        this.health += amount;

        this.health =
            this.clamp(
                this.health,
                0,
                this.maxHealth
            );

        this.applyToPlayer();
    }


    // ========================================================
    // FOOD
    // ========================================================

    eatFood(amount = 20) {

        if (this.isDead) {
            return false;
        }

        this.hunger += amount;

        this.hunger =
            this.clamp(
                this.hunger,
                0,
                this.maxHunger
            );

        return true;
    }


    // ========================================================
    // DRINK WATER
    // ========================================================

    drinkWater(amount = 30) {

        if (this.isDead) {
            return false;
        }

        this.thirst += amount;

        this.thirst =
            this.clamp(
                this.thirst,
                0,
                this.maxThirst
            );

        return true;
    }


    // ========================================================
    // REST
    // ========================================================

    rest(amount = 25) {

        if (this.isDead) {
            return false;
        }

        this.fatigue -= amount;

        this.fatigue =
            this.clamp(
                this.fatigue,
                0,
                this.maxFatigue
            );

        this.stamina =
            this.clamp(
                this.stamina + amount,
                0,
                this.maxStamina
            );

        return true;
    }


    // ========================================================
    // APPLY PLAYER VALUES
    // ========================================================

    applyToPlayer() {

        if (!this.player) {
            return;
        }


        this.player.health =
            this.health;

        this.player.maxHealth =
            this.maxHealth;


        this.player.stamina =
            this.stamina;

        this.player.maxStamina =
            this.maxStamina;


        // Exhaustion reduces stamina

        if (this.isExhausted) {

            this.player.stamina =
                Math.min(
                    this.player.stamina,
                    20
                );
        }
    }


    // ========================================================
    // DEATH
    // ========================================================

    handleDeath() {

        if (
            this.player &&
            this.player.velocity
        ) {

            this.player.velocity.set(
                0,
                0,
                0
            );
        }

        console.log(
            "KIAN DIED - SURVIVAL FAILURE"
        );
    }


    // ========================================================
    // RESET
    // ========================================================

    reset() {

        this.health = 100;

        this.stamina = 100;

        this.hunger = 100;

        this.thirst = 100;

        this.temperature = 50;

        this.fatigue = 0;

        this.isStarving = false;

        this.isDehydrated = false;

        this.isCold = false;

        this.isHot = false;

        this.isExhausted = false;

        this.isDead = false;

        this.applyToPlayer();
    }


    // ========================================================
    // GET STATUS
    // ========================================================

    getStatus() {

        return {

            health:
                Math.round(
                    this.health
                ),

            stamina:
                Math.round(
                    this.stamina
                ),

            hunger:
                Math.round(
                    this.hunger
                ),

            thirst:
                Math.round(
                    this.thirst
                ),

            temperature:
                Math.round(
                    this.temperature
                ),

            fatigue:
                Math.round(
                    this.fatigue
                ),

            starving:
                this.isStarving,

            dehydrated:
                this.isDehydrated,

            cold:
                this.isCold,

            hot:
                this.isHot,

            exhausted:
                this.isExhausted,

            dead:
                this.isDead
        };
    }


    // ========================================================
    // CLAMP
    // ========================================================

    clamp(
        value,
        min,
        max
    ) {

        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );
    }


    // ========================================================
    // DISPOSE
    // ========================================================

    dispose() {

        this.player = null;

        this.terrain = null;
    }
}
