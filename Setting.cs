using Colossal.IO.AssetDatabase;
using Game.Input;
using Game.Modding;
using Game.Settings;

namespace TopLeftCollapse
{
    // The mod's page in the game's Options menu. The game saves it to its own small
    // file (ModsSettings/TopLeftCollapse), separate from save games.
    [FileLocation("ModsSettings/" + Mod.Id + "/" + Mod.Id)]
    [SettingsUIGroupOrder(kAreasGroup, kGeneralGroup, kKeybindGroup)]
    [SettingsUIShowGroupName(kAreasGroup, kGeneralGroup, kKeybindGroup)]
    [SettingsUIKeyboardAction(kToggleActionName, ActionType.Button, usages: new[] { Mod.Id, Usages.kDefaultUsage })]
    public class Setting : ModSetting
    {
        // The shortcut's name inside the game. Never rename it once published, or
        // players who changed the key would get the default back.
        public const string kToggleActionName = "TopLeftCollapseToggle";

        public const string kSection = "Main";
        public const string kAreasGroup = "Areas";
        public const string kGeneralGroup = "General";
        public const string kKeybindGroup = "Keybinding";

        public Setting(IMod mod) : base(mod) { }

        // ── Which corners get an arrow ────────────────────────────────────────
        [SettingsUISection(kSection, kAreasGroup)]
        public bool TidyTopLeft { get; set; } = true;

        [SettingsUISection(kSection, kAreasGroup)]
        public bool TidyTopRight { get; set; } = false;

        // ── General ───────────────────────────────────────────────────────────
        // Turn the sliding motion off for an instant hide/show.
        [SettingsUISection(kSection, kGeneralGroup)]
        public bool SlideAnimation { get; set; } = true;

        // How long the slide (and the arrow's swivel) takes. Shown as a drop-down.
        // The numbers are milliseconds and are sent straight to the screen side.
        public enum SlideSpeedOption
        {
            Fast = 250,
            Normal = 500,
            Slow = 1000,
        }

        [SettingsUISection(kSection, kGeneralGroup)]
        public SlideSpeedOption SlideSpeed { get; set; } = SlideSpeedOption.Normal;

        // ── Keyboard shortcut (Alt + C to start with) ─────────────────────────
        [SettingsUIKeyboardBinding(BindingKeyboard.C, kToggleActionName, alt: true)]
        [SettingsUISection(kSection, kKeybindGroup)]
        public ProxyBinding ToggleKey { get; set; }

        // ── Remembered, not shown on the Options page ─────────────────────────
        // Whether each corner was collapsed. "Collapsed" is the top-left one (its name is
        // kept from the first version so existing settings files still work).
        [SettingsUIHidden]
        public bool Collapsed { get; set; }

        [SettingsUIHidden]
        public bool CollapsedTopRight { get; set; }

        // No longer used. Test builds had a "pin favourites" feature that saved here.
        // Kept so a settings file from those builds still loads cleanly; Mod.cs empties it.
        [SettingsUIHidden]
        public string PinnedButtons { get; set; } = "";

        public override void SetDefaults()
        {
            TidyTopLeft = true;
            TidyTopRight = false;
            SlideAnimation = true;
            SlideSpeed = SlideSpeedOption.Normal;
            Collapsed = false;
            CollapsedTopRight = false;
            PinnedButtons = "";
        }
    }
}
