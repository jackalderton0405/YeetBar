using System;
using Colossal.IO.AssetDatabase;
using Colossal.Logging;
using Game;
using Game.Modding;
using Game.SceneFlow;
using TopLeftCollapse.Localization;
using TopLeftCollapse.Systems;

namespace TopLeftCollapse
{
    // Runs when the game loads the mod: sets up the Options page, the English text,
    // and the small system that talks to the screen side.
    //
    // This mod never reads or writes city data. It only changes how the top-left
    // buttons look on screen, and keeps its few settings in its own file. Save games are never touched.
    public class Mod : IMod
    {
        public const string Id = nameof(TopLeftCollapse);

        public static ILog log = LogManager.GetLogger($"{Id}.{nameof(Mod)}").SetShowsErrorsInUI(false);

        public static Setting Setting { get; private set; }

        public void OnLoad(UpdateSystem updateSystem)
        {
            // If anything here fails, log one clear error and stay switched off,
            // rather than half-loading and causing knock-on errors.
            Setting setting = null;
            try
            {
                setting = new Setting(this);
                setting.RegisterInOptionsUI();
                setting.RegisterKeyBindings();
                GameManager.instance.localizationManager.AddSource("en-US", new LocaleEN(setting));
                AssetDatabase.global.LoadSettings(Id, setting, new Setting(this));
                // Pins from test builds are no longer used: forget them (saved with the next change).
                setting.PinnedButtons = "";
                Setting = setting;
            }
            catch (Exception ex)
            {
                log.Error($"Start-up failed, the mod is switched off for this session: {ex}");
                try { setting?.UnregisterInOptionsUI(); } catch { /* it may never have registered */ }
                Setting = null;
                return;
            }

            updateSystem.UpdateAt<CollapseUISystem>(SystemUpdatePhase.UIUpdate);
        }

        public void OnDispose()
        {
            Setting?.UnregisterInOptionsUI();
            Setting = null;
        }
    }
}
