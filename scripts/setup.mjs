import {MODULE, TRIGGERS} from "./constants.mjs";
import {callMacro, DoorMacroConfig} from "./doormacro.mjs";

// Create a button in a door's header.
Hooks.on("getWallConfigHeaderButtons", (config, buttons) => {
  if (config.document.door === CONST.WALL_DOOR_TYPES.NONE) return;

  buttons.unshift({
    class: MODULE,
    icon: "fa-solid fa-door-open",
    onclick: () => new DoorMacroConfig({document: config.document}).render({force: true})
  });
});

Hooks.once("setup", () => {
  WallDocument.prototype.callMacro = async function(type = "never", options = {}) {
    return callMacro(this, type, options);
  };
});

// save previous state of door.
Hooks.on("preUpdateWall", (wallDoc, update, context, userId) => {
  const {WALL_DOOR_STATES: DS, WALL_DOOR_TYPES: DOOR} = CONST;

  // ignore this if the Door type involves toggling between wall and door.
  if ((wallDoc.door === DOOR.NONE) || (update.door === DOOR.NONE)) return;

  const hasDS = foundry.utils.hasProperty(update, "ds");
  const hasDOOR = foundry.utils.hasProperty(update, "door");

  const wasSecret = wallDoc.door === DOOR.SECRET;
  const toSecret = update.door === DOOR.SECRET;

  const wasLocked = wallDoc.ds === DS.LOCKED;
  const toLocked = update.ds === DS.LOCKED;

  const wasOpen = wallDoc.ds === DS.OPEN;
  const toOpen = update.ds === DS.OPEN;
  const toClosed = update.ds === DS.CLOSED;

  context[MODULE] = {
    [wallDoc.id]: {
      whenClosed: wasOpen && toClosed,
      whenOpened: !wasOpen && toOpen,
      whenHidden: !wasSecret && toSecret,
      whenRevealed: wasSecret && (hasDOOR && !toSecret),
      whenLocked: !wasLocked && toLocked,
      whenUnlocked: wasLocked && (hasDS && !toLocked)
    }
  };
});

Hooks.on("updateWall", (wallDoc, update, context, userId) => {
  const {id: gmId} = game.users.find(user => {
    return user.active && user.isGM;
  }) ?? {};
  TRIGGERS.map(trigger => {
    const property = `${MODULE}.${wallDoc.id}.${trigger}`;
    const triggered = foundry.utils.getProperty(context, property);
    if (triggered) callMacro(wallDoc, trigger, {gmId, userId});
  });
});
