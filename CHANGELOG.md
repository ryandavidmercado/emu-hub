## 1.0.0 Beta 3
* Fix: Fix de-sync between selection and active game when navigating back to a Game List Page (All Games, Search, etc)
* Feature: Custom search queries when scraping per-game

## 1.0.0 Beta 2
* Feature: Select default emulators per-system (Settings -> Games -> Default Emulators)
* Fix: Reset Home scrollers after launching a game
    * This brings us in line with expected behavior of Home highlighting our recently-launched game
    * This fixes the most obvious crash case for navigating back to an invalid scroller index
* Fix: Wrap URL-based scroller params for access safety
    * This fixes less obvious crash cases for navigating back to an invalid scroller index (ex: deleting the last game in a list)
* Feature: Add Jump to Collections button on Home (Y)
* Feature: Add native keyboard support for input modals (setting ROMs directory, rename game, search, etc)
* Feature: Add support for moving input caret in keyboard
* Feature: Support renaming collections (Settings -> Collections -> [Some Collection] -> Rename "Some Collection")
* Fix: Don't overwrite user's game tile art selection when re-scraping a game
* Add emulator: Ryujinx (Switch)
* Fix: Remove Yuzu from default emulators for MacOS
* Feature: Add app icon
* Fix: Add .zip to supported extensions for NDS
* EXPERIMENTAL: Build for Linux ARM
