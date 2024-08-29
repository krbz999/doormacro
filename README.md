Interested in following along with development of any of my modules? Join the [Discord server](https://discord.gg/QAG8eWABGT).

# Door Macro
Apply macro directly to the door.

You can apply a macro to a door. You can trigger this macro when the door is opened, closed, locked, unlocked, hidden, or revealed.

![doormacro](https://user-images.githubusercontent.com/50169243/196046201-315a5d12-7ff5-4d24-8757-d1078dd8965e.png)

Open a door's config and enter the macro editor placed in the header (door icon).
If the macro needs to do things only a GM is allowed to do, like toggle lights for example, you can set the macro to be executed as GM. This will cause the macro to find the first active GM available and execute it as them. If not set to be executed as GM, the macro is executed as the user who changed the state of the door.

In addition, there is now `WallDocument#callMacro(type="never", options={})`, which can be used to execute an arbitrary script embedded on the Door manually. The types are   "whenOpened", "whenClosed", "whenLocked", "whenUnlocked", "whenHidden", "whenRevealed", and "never", the last of which is never executed automatically.

When a script is executed, the following parameters are made available:
- `door`: The `WallDocument` that was changed.
- `scene`: The `Scene` in which the door is embedded.
- `event`: An object containing additional data.
- `event.user`: The `User` that triggered the script.
- `event.trigger`: The triggering event name from the list above.
