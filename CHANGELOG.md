## 1.0.0 Beta 2
* Feature: Select default emulators per-system
* Reset Home scrollers after launching a game
    * This brings us in line with expected behavior of Home highlighting our recently-launched game
    * This fixes the most obvious crash case for navigating back to an invalid scroller index
* Fix: Wrap URL-based scroller params for access safety
    * This fixes less obvious crash cases for navigating back to an invalid scroller index (ex: deleting the last game in a list)
* Add Jump to Collections button on Home
* Add native keyboard support for input modals (setting ROMs directory, rename game, search, etc)
* Add support for moving input caret in keyboard
* Support renaming collections (Settings -> Collections -> [Some Collection] -> Rename "Some Collection")
* Don't overwrite user's game tile art selection when re-scraping a game
* Add emulator: Ryujinx (Switch)
* Remove Yuzu from default emulators for MacOS
* Add app icon
