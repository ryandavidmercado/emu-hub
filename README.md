# EmuHub

![EmuHub Home](https://github.com/ryandavidmercado/emu-hub/assets/78172310/3ccb4bc2-5171-4125-a2e7-5c049a2e71cf)
![EmuHub Game View](https://github.com/ryandavidmercado/emu-hub/assets/78172310/696f4025-ca7e-4b7f-9c7b-735c6f610152)
![EmuHub Stores](https://github.com/ryandavidmercado/emu-hub/assets/78172310/914a6941-b217-4fd7-be2b-3025c7ef9374)


emu(lator) | *noun*:
> hardware or software that permits programs written for one computer to be run on another computer

hub | *noun*:
> the effective center of an activity

## Initial Setup
1. Verify you've installed necessary emulators
    * EmuHub currently only supports one emulator per system; the needed dependencies are listed below under Supported Systems.
    * If you're running on a Steam Deck with EmuDeck installed, this has already been taken care of for you.
1. Launch EmuHub
    * This will generate config, asset, and rom folders under Documents/EmuHub
1. Change ROMs Directory (optional)
    * Edit Documents/EmuHub/config/paths.yml
    * ROMs directory can be entered into the ROMs property of the config
      * EmuHub follows ES-DE naming conventions for systems.
          * Example: `[ROM-FOLDER]/nes/Super Mario Bros 3.nes`
    * Don't worry about RetroArch -> bin and RetroArch -> cores being empty; these are fallback values meant to be set if the defaults don't work. Only adjust these if RetroArch-based systems aren't launching!
    * Restart EmuHub to apply changes
1. Scrape games!
    1. Hit START to open the EmuHub menu
    1. Navigate to Games > Scrape Games > ScreenScraper Credentials
    1. Enter ScreenScraper username and password (optional but strongly recommended)
    1. Navigate back to Games > Scrape Games
    1. Hit Start Scraping to initiate scraping
1. Explore!
    * Check out Settings > Stores to download homebrew from EmuDeck
    * Select any game from the Home page to enter the Game View
        * Try creating a new collection! Collections will display individual scrollers in the Home page
        * Hit Down in the Game View to access game information and dynamic recommendations (by genre, developer, and publisher)
    * Hit Play on the Game View to launch
  
## Troubleshooting
> My games are failing to launch!
If you've already followed step 1 and verified that you've installed the necessary RetroArch cores and standalone emulators, you might need to edit the config paths.
* Non-RetroArch systems (PS2, etc)
    * Edit Documents/EmuHub/config/emulators.yml
* RetroArch systems
    * Find the path to
        1. Your RetroArch executable
        2. Your RetroArch cores
    * Edit the RetroArch -> bin and RetroArch -> cores properties of Documents/EmuHub/config/paths.yml  

## Supported Systems
* Nintendo Entertainment System (RetroArch - Mesen)
* Super Nintendo Entertainment System (RetroArch - bsnes)
* Nintendo 64 (RetroArch - Mupen64Plus-Next)
* Nintendo GameCube (Dolphin)
* Nintendo Wii (Dolphin)
* Nintendo Wii U *(wua only)* (Cemu)
* Nintendo Switch (yuzu)
* Game Boy (RetroArch - Sameboy)
* Game Boy Color (RetroArch - Sameboy)
* Game Boy Advance (RetroArch - mGBA)
* Nintendo DS (RetroArch - melonDS)
* Sega Genesis (RetroArch - Genesis Plus GX)
* Sega Saturn (RetroArch - Beetle Saturn)
* Dreamcast (RetroArch - Flycast)
* Sony PlayStation (DuckStation)
* Sony PlayStation 2 (PCSX2)
* Sony PlayStation Portable (PPSSPP)

## Supported Platforms
* Linux
* MacOS
* Windows (WIP)
