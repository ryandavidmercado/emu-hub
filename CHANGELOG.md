## 1.0.0 Beta 2
* Select default emulators per-system
* Reset Home scrollers after launching a game
    * This brings us in line with expected behavior of Home highlighting our recently-launched game
    * This fixes the most obvious crash case for navigating back to an invalid scroller index
* Fix: Wrap URL-based scroller params for access safety
    * This fixes less obvious crash cases for navigating back to an invalid scroller index (ex: deleting the last game in a list)
* Add Jump to Collections button on Home
