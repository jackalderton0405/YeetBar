using System;
using Colossal.UI.Binding;
using Game.Input;
using Game.UI;

namespace TopLeftCollapse.Systems
{
    // Talks to the screen side: which corners are switched on, which are collapsed, and how
    // they slide. Saves changes to the mod's settings file so they're the same next time.
    // Also listens for the keyboard shortcut (Alt + C to start with).
    public partial class CollapseUISystem : UISystemBase
    {
        // Must match GROUP in UI/src/mods/collapse/bindings.ts.
        private const string kGroup = "topLeftCollapse";

        // Corner names, as the screen side sends them (UI/src/mods/collapse/areas.ts).
        private const string kTopLeft = "topLeft";
        private const string kTopRight = "topRight";

        private ValueBinding<bool> m_TopLeft, m_TopRight;
        private ValueBinding<bool> m_TidyTopLeft, m_TidyTopRight;
        private ValueBinding<bool> m_Animate;
        private ValueBinding<int> m_SlideMs;
        private ProxyAction m_ToggleAction;

        protected override void OnCreate()
        {
            base.OnCreate();
            var s = Mod.Setting;
            AddBinding(m_TopLeft = new ValueBinding<bool>(kGroup, "collapsed", s?.Collapsed ?? false));
            AddBinding(m_TopRight = new ValueBinding<bool>(kGroup, "collapsedTopRight", s?.CollapsedTopRight ?? false));
            AddBinding(m_TidyTopLeft = new ValueBinding<bool>(kGroup, "tidyTopLeft", s?.TidyTopLeft ?? true));
            AddBinding(m_TidyTopRight = new ValueBinding<bool>(kGroup, "tidyTopRight", s?.TidyTopRight ?? false));
            AddBinding(m_Animate = new ValueBinding<bool>(kGroup, "animate", s?.SlideAnimation ?? true));
            AddBinding(m_SlideMs = new ValueBinding<int>(kGroup, "slideMs", SlideMs()));
            AddBinding(new TriggerBinding<string, bool>(kGroup, "setAreaCollapsed", SetAreaCollapsed));

            m_ToggleAction = s?.GetAction(Setting.kToggleActionName);
            if (m_ToggleAction != null) m_ToggleAction.shouldBeEnabled = true;
        }

        protected override void OnUpdate()
        {
            base.OnUpdate();
            if (m_ToggleAction != null && m_ToggleAction.WasPerformedThisFrame()) ToggleAll();

            // Picks up changes made on the Options page.
            // Update() only sends something when the value has actually changed.
            var s = Mod.Setting;
            if (s != null)
            {
                m_TidyTopLeft.Update(s.TidyTopLeft);
                m_TidyTopRight.Update(s.TidyTopRight);
                m_Animate.Update(s.SlideAnimation);
                m_SlideMs.Update(SlideMs());
            }
        }

        protected override void OnDestroy()
        {
            if (m_ToggleAction != null) m_ToggleAction.shouldBeEnabled = false;
            base.OnDestroy();
        }

        // The shortcut: collapse every switched-on corner, or open them all if they're all collapsed.
        private void ToggleAll()
        {
            var s = Mod.Setting;
            if (s == null) return;
            bool anyOpen =
                (s.TidyTopLeft && !s.Collapsed) ||
                (s.TidyTopRight && !s.CollapsedTopRight);
            if (s.TidyTopLeft) Apply(kTopLeft, anyOpen);
            if (s.TidyTopRight) Apply(kTopRight, anyOpen);
            Save();
        }

        private void SetAreaCollapsed(string area, bool collapsed)
        {
            if (Apply(area, collapsed)) Save();
        }

        // Sets one corner's state and tells the screen. Returns true if the saved value changed.
        private bool Apply(string area, bool collapsed)
        {
            var s = Mod.Setting;
            switch (area)
            {
                case kTopLeft:
                    m_TopLeft.Update(collapsed);
                    if (s == null || s.Collapsed == collapsed) return false;
                    s.Collapsed = collapsed;
                    return true;
                case kTopRight:
                    m_TopRight.Update(collapsed);
                    if (s == null || s.CollapsedTopRight == collapsed) return false;
                    s.CollapsedTopRight = collapsed;
                    return true;
                default:
                    return false; // not a corner we know: ignore it
            }
        }

        // The slide time in milliseconds, kept to the three choices on the Options page.
        private static int SlideMs()
        {
            var ms = (int)(Mod.Setting?.SlideSpeed ?? Setting.SlideSpeedOption.Normal);
            return ms == 250 || ms == 1000 ? ms : 500;
        }

        private static void Save()
        {
            try { Mod.Setting.ApplyAndSave(); }
            catch (Exception e) { Mod.log.Warn($"Couldn't save settings: {e.Message}"); }
        }
    }
}
