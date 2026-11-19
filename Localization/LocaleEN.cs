using System.Collections.Generic;
using Colossal;

namespace TopLeftCollapse.Localization
{
    // English text for the Options page and the arrow's tooltip.
    // Another language = a copy of this file with the text translated,
    // registered in Mod.cs with that language's code (for example "de-DE").
    public class LocaleEN : IDictionarySource
    {
        // Text the screen side shows. The keys must match UI/src/mods/collapse/text.ts.
        public const string HideButtonsKey = Mod.Id + ".UI[HideButtons]";
        public const string ShowButtonsKey = Mod.Id + ".UI[ShowButtons]";

        private readonly Setting m_Setting;

        public LocaleEN(Setting setting)
        {
            m_Setting = setting;
        }

        public IEnumerable<KeyValuePair<string, string>> ReadEntries(IList<IDictionaryEntryError> errors, Dictionary<string, int> indexCounts)
        {
            return new Dictionary<string, string>
            {
                { m_Setting.GetSettingsLocaleID(), "Stash Bar" },
                { m_Setting.GetOptionLabelLocaleID(nameof(Setting.TidyTopLeft)), "Tidy top-left buttons" },
                { m_Setting.GetOptionDescLocaleID(nameof(Setting.TidyTopLeft)),
                    "Adds an arrow next to the game's \"i\" button that slides the mod buttons in the top-left corner away." },
                { m_Setting.GetOptionLabelLocaleID(nameof(Setting.TidyTopRight)), "Tidy top-right buttons" },
                { m_Setting.GetOptionDescLocaleID(nameof(Setting.TidyTopRight)),
                    "Adds an arrow next to the game's lightbulb and gear buttons that slides the mod buttons in the top-right corner away. The game's own buttons always stay." },
                { m_Setting.GetOptionLabelLocaleID(nameof(Setting.SlideAnimation)), "Slide animation" },
                { m_Setting.GetOptionDescLocaleID(nameof(Setting.SlideAnimation)),
                    "When on, the mod buttons slide in and out. When off, they hide and show instantly." },
                { m_Setting.GetOptionLabelLocaleID(nameof(Setting.SlideSpeed)), "Slide speed" },
                { m_Setting.GetOptionDescLocaleID(nameof(Setting.SlideSpeed)),
                    "How long the buttons take to slide in and out." },
                { m_Setting.GetEnumValueLocaleID(Setting.SlideSpeedOption.Fast), "Fast (0.25 s)" },
                { m_Setting.GetEnumValueLocaleID(Setting.SlideSpeedOption.Normal), "Normal (0.5 s)" },
                { m_Setting.GetEnumValueLocaleID(Setting.SlideSpeedOption.Slow), "Slow (1 s)" },
                { m_Setting.GetOptionTabLocaleID(Setting.kSection), "Main" },
                { m_Setting.GetOptionGroupLocaleID(Setting.kAreasGroup), "What to tidy" },
                { m_Setting.GetOptionGroupLocaleID(Setting.kGeneralGroup), "Slide" },
                { m_Setting.GetOptionGroupLocaleID(Setting.kKeybindGroup), "Keyboard shortcut" },

                // Keyboard shortcut
                { m_Setting.GetBindingMapLocaleID(), "Stash Bar" },
                { m_Setting.GetBindingKeyLocaleID(Setting.kToggleActionName), "Collapse or expand the mod buttons" },
                { m_Setting.GetOptionLabelLocaleID(nameof(Setting.ToggleKey)), "Collapse / expand" },
                { m_Setting.GetOptionDescLocaleID(nameof(Setting.ToggleKey)),
                    "Collapses both corners that are switched on, or opens them again if they're all collapsed." },

                // The arrow's tooltip
                { HideButtonsKey, "Hide mod buttons" },
                { ShowButtonsKey, "Show mod buttons" },
            };
        }

        public void Unload() { }
    }
}
