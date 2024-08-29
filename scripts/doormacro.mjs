import {MODULE, TRIGGERS} from "./constants.mjs";

/**
 * Execute macros.
 * @param {WallDocument} wallDoc      The door.
 * @param {string} trigger            The trigger.
 * @param {object} context            An object of user ids.
 * @param {string} context.gmId       The first active GM found.
 * @param {string} context.userId     The id of the user who changed the door.
 */
export function callMacro(wallDoc, trigger, {gmId, userId}) {
  const data = wallDoc.getFlag(MODULE, trigger) ?? {};
  if (!data.command) return;

  const id = data.asGM ? gmId : userId;
  if ((game.user.id !== id) && !!id) return;
  const fn = new foundry.utils.AsyncFunction("door", "scene", "event", data.command);

  const door = wallDoc;
  const scene = wallDoc.parent;
  const event = {user: game.users.get(userId), trigger: trigger};
  return fn.call({}, door, scene, event);
}

export class DoorMacroConfig extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.DocumentSheetV2
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: [MODULE, "standard-form"],
    position: {width: 500, height: "auto"},
    window: {title: "DOORMACRO.Config.Title", icon: "fa-solid fa-code", contentClasses: ["standard-form"]},
    form: {closeOnSubmit: true}
  };

  /** @override */
  static PARTS = {
    nav: {
      template: "templates/generic/tab-navigation.hbs"
    },
    form: {
      template: "modules/doormacro/templates/doormacro.hbs",
      scrollable: [""]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  };

  /** @override */
  get title() {
    return game.i18n.format(this.options.window.title, {id: this.document.id});
  }

  /** @override */
  tabGroups = {
    primary: "whenOpened"
  };

  /** @override */
  async _prepareContext(options) {
    const tabs = {};
    const dm = this.document.flags[MODULE] ?? {};
    for (const trigger of TRIGGERS) {
      const t = dm[trigger] ?? {};
      const label = game.i18n.localize(`DOORMACRO.${trigger}`);

      tabs[trigger] = {
        id: trigger,
        group: "primary",
        label: `DOORMACRO.${trigger}`,
        asGM: t.asGM,
        asGMField: new foundry.data.fields.BooleanField({
          label: "DOORMACRO.AS_GM",
          hint: "DOORMACRO.AsGMTooltip"
        }),
        asGMName: `flags.doormacro.${trigger}.asGM`,
        command: t.command ?? "",
        commandField: new foundry.data.fields.JavaScriptField({
          label: game.i18n.format("DOORMACRO.Config.Command", {
            trigger: label
          }),
          required: true
        }),
        commandName: `flags.doormacro.${trigger}.command`
      };
    }
    for (const v of Object.values(tabs)) {
      v.active = this.tabGroups[v.group] === v.id;
      v.cssClass = v.active ? "active" : "";
    }

    return {
      tabs: tabs,
      name: game.i18n.format("DOORMACRO.Door", {id: this.document.id}),
      buttons: [{type: "submit", icon: "fa-solid fa-save", label: "Save"}]
    };
  }

  /** @override */
  _processFormData(event, form, formData) {
    formData = foundry.utils.expandObject(formData.object);
    for (const trigger of TRIGGERS) {
      const cmd = foundry.utils.getProperty(formData, `flags.${MODULE}.${trigger}.command`);
      if (!cmd) {
        delete formData.flags?.[MODULE]?.[trigger];
        foundry.utils.setProperty(formData, `flags.${MODULE}.-=${trigger}`, null);
      }
    }
    return formData;
  }
}
