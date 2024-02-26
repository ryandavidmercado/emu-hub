# EmuHub

![EmuHub Home](https://github.com/ryandavidmercado/emu-hub/assets/78172310/4652762b-4465-4a34-9a58-37edd666e990)
![EmuHub Game View](https://github.com/ryandavidmercado/emu-hub/assets/78172310/58d81c57-578a-46df-8d49-e4929978ded9)
![EmuHub Store](https://github.com/ryandavidmercado/emu-hub/assets/78172310/b8f33c68-fbe6-422f-8802-7e06a87ee79d)
![EmuHub All Games](https://github.com/ryandavidmercado/emu-hub/assets/78172310/565ef5d8-f1a9-4a37-973d-3770485b5627)

emu(lator) | _noun_:

> hardware or software that permits programs written for one computer to be run on another computer

hub | _noun_:

> the effective center of an activity

[Latest Release](https://github.com/ryandavidmercado/emu-hub/releases/latest) | [Discord](https://discord.gg/Uma7bmqB)

## Features

* Sleek, modern UI (look at that wave go!)
* Games-first paradigm
    * EmuHub prefers to organize games by relevant info (Recently Played, Recommended, Collections, etc) instead of by system. This makes it much easier to forget that you're emulating so you can focus on enjoying your collection!
* Universal exit game hotkey: LT + RT + Up + Y to exit from any running game back to EmuHub (Not supported on MacOS due to platform constraints)
* Scraping support (ScreenScraper, IGDB)
* In-app homebrew stores
* Automatic ROM scanning
* Automatic emulator detection
* Automatic emulator installation (Linux only; MacOS/Windows on the roadmap)
* Easily-accessible game collections
    * Press Add to Collection on any Game View
    * Collections show up directly on the Home screen!
* Customizable game art
    * Modify Home showcase to show screenshot or fanart
    * Modify Game View to show screenshot or fanart
    * Modify Game Tile to show poster, screenshot + logo or fanart + logo
* Multiple color themes

## Initial Setup

1. Download the [latest release](https://github.com/ryandavidmercado/emu-hub/releases/latest)
1. (MacOS only) Open the DMG file and drag EmuHub.app onto the Installations folder.
1. (Linux/Steam Deck only)
   - Make sure to set the EmuHub AppImage to executable: https://docs.appimage.org/introduction/quickstart.html
   - If you're planning on running EmuHub from Game Mode, make sure to set the launch arguments in Steam to --no-sandbox, otherwise the app will fail to launch.
1. Verify you've installed necessary emulators
   - The needed dependencies are listed below under Supported Systems. You only need one emulator for any system that lists multiple options.
   - If you're running on a Steam Deck with EmuDeck installed, this has already been taken care of for you. (DISCLAIMER: EmuHub is not affiliated with EmuDeck!)
   - If you're running on a Linux system with Flatpak, EmuHub can install emulators for you! Attempting to launch a game without the required emulator will prompt you to confirm the installation.
     - EmuHub will not configure the emulator for you yet! You might have to set up controls yourself, configure BIOS, etc. Consult the respective emulator's documentation if you run into any trouble.
     - MacOS support through Homebrew and Windows support through scoop for automatic emulator installation is on the roadmap but not yet implemented.
1. Launch EmuHub
   - This will generate ROMs, assets, and config folders for you and guide you through initial setup
1. Scrape games!
   1. Hit START to open the EmuHub menu
   1. Navigate to Games > Scrape Games > ScreenScraper Credentials
   1. Enter ScreenScraper username and password (optional but strongly recommended)
   1. Navigate back to Games > Scrape Games
   1. Hit Start Scraping to initiate scraping
1. Explore!
   - Keep an eye on the Controller Hints in the footer; they'll guide you through navigation and sometimes signal features you might otherwise miss.
   - Check out Settings > Stores to download homebrew from EmuDeck (DISCLAIMER: EmuHub is not affiliated with EmuDeck!)
   - Select any game from the Home page to enter the Game View
   - Select Play on the Game View to launch
   - Select in the Game View to access game information and dynamic recommendations (by genre, developer, and publisher)
   - Select "Add to Collection" in the Game View to create your first collection!
     - Collections are great because they surface directly as scrollers on the Home Page
       - It has never been easier to access every Mario Kart in your collection.
   - Hit Select at any time to access the Navigation Menu
     - Home: The main screen; this is what you see when you launch EmuHub.
     - All Games: Self-explanatory. All games!
     - Search Games: Self-explanatory. Search your games collection!
   - Keep scraping as you add new games! The more you scrape, the better EmuHub will get.
     - EmuHub uses scraped data to surface per-game and general recommendations.
     - Powerful sorting and filtering tools are on the roadmap. The more data you have scraped, the easier it'll be to discover new games in your collection!

## Supported Systems

- Nintendo Entertainment System (RetroArch - Mesen)
- Super Nintendo Entertainment System (RetroArch - bsnes)
- Nintendo 64 (RetroArch - Mupen64Plus-Next, RetroArch - ParaLLEl)
- Nintendo GameCube (Dolphin)
- Nintendo Wii (Dolphin)
- Nintendo Wii U (Cemu)
- Nintendo Switch (Yuzu, Ryujinx)
- Game Boy (RetroArch - Sameboy, RetroArch - Gambatte, RetroArch - mGBA)
- Game Boy Color (RetroArch - Sameboy, RetroArch - Gambatte, RetroArch - mGBA)
- Game Boy Advance (RetroArch - mGBA)
- Nintendo DS (RetroArch - melonDS)
- Sega Genesis (RetroArch - Genesis Plus GX)
- Sega Saturn (RetroArch - Beetle Saturn)
- Dreamcast (RetroArch - Flycast)
- Sony PlayStation (DuckStation)
- Sony PlayStation 2 (PCSX2)
- Sony PlayStation 3 (RPCS3)
- Sony PlayStation Portable (PPSSPP)
- Sony PlayStation Vita (Vita3K)
- More on the roadmap ...

## Supported Platforms

- Linux
- MacOS
- Windows (WIP)

## Data Directories

- Linux:
   - ROMs: If you have EmuDeck installed, EmuHub will use EmuDeck's configured roms path. If you don't, ROMs are stored under $XDG_DATA_HOME/EmuHub/roms or ~/.local/share/EmuHub/roms.
   - Assets: $XDG_DATA_HOME/EmuHub/assets or ~/.local/share/EmuHub/assets
   - Config: $XDG_CONFIG_HOME/EmuHub/EmuHubConfig or ~/.config/EmuHub/EmuHubConfig
- MacOS:
   - ROMs: ~/Documents/EmuHub/roms
   - Assets: ~/Documents/EmuHub/assets
   - Config: ~/Library/Application Support/EmuHub/EmuHubConfig
- Windows (**WIP**)
   - ROMs: C:\Users\[YOUR-USERNAME]\Documents\EmuHub\roms
   - Assets: C:\Users\[YOUR-USERNAME]\Documents\EmuHub\assets
   - Config: C:\Users\[YOUR-USERNAME]\AppData\Roaming\EmuHub\EmuHubConfig

## Troubleshooting

> EmuHub won't launch! (I'm on Steam Deck)

Make sure you've set the EmuHub AppImage to executable: https://docs.appimage.org/introduction/quickstart.html

If you're running EmuHub through Game Mode, [add --no-sandbox to the launch options](https://help.steampowered.com/en/faqs/view/7D01-D2DD-D75E-2955) for EmuHub in Steam.

> EmuHub said emulator not found when I tried to launch SOME GAME, but I have that emulator installed!

Please file an issue on this GitHub repository or leave a comment in your platform's support channel on [our Discord](https://discord.gg/Uma7bmqB).

> RetroArch crashes when I run N64 games! (I'm on MacOS)

The default emulator for N64 (Mupen64Plus-Next) has some compatibility issues with non-Metal builds of RetroArch for MacOS. Either download [the newest RetroArch nightly](https://www.retroarch.com/index.php?page=platforms) or set the default emulator for N64 to ParaLLEl (Settings -> Games -> Default Emulators -> Nintendo 64).

## ADVANCED - Adding custom systems/emulators

EmuHub does not yet have a GUI for adding custom systems; you'll need to add these entries to the config files. (Alternatively, leave a comment in the #system-requests channel of [our Discord](https://discord.gg/Uma7bmqB) so we can add the system to our roadmap!)

1. Head to the EmuHub config directory for your respective platform (see: [Data Directories](#data-directories))
1. Open systems.yml
    - This file will be blank; this is expected! Default system entries can be referenced at EmuHubConfig/defaults/systems.yml.
1. Add a new entry:
    - ```yaml
      - id: mycoolsystem # System ID shorthand; by default this will be used as the name of the ROMs directory.
        ssId: 57 # Optional - ScreenScraper system ID. Including this improves scraping accuracy when scraping with ScreenScraper.
        igdbId: 57 # Optional - ScreenScraper system ID. Including this improves scraping accuracy when scraping with IGDB.
        handheld: true # Optional - Indicates that the system is a handheld.
        name: My Cool System
        emulators: # Correspond to IDs in emulators.yml. If you haven't made the necessary emulator entry yet, come up with an ID here and use it in the next step!
          - my_cool_system_emu
          - other_my_cool_system_emu
        fileExtensions: # Files that don't match one of these extensions won't be included in the games list!
          - .someExt
          - .someOtherExt
        releaseYear: "1999" # Optional
        company: SystemBoys # Optional
        defaultNames: # ADVANCED - Optional - used for defining default name logic per-file extension. If unspecified, default game names are derived from the file name. Useful for NAND-based systems like PS3 and Vita.
          .someExt:
            type: pathToken # Only supported type currently; defines default name as a function of relative path
            token: -2 # For use with type pathToken. If a ROM is located at games/My Cool Game/GAME_DATA/data.someExt, -2 gives us "My Cool Name" as the default name. -1 would give us "GAME_DATA".
            map: mycoolsystemmap # Optional - Not useful for custom systems since maps currently aren't user-configurable. Maps the name derived from the pathToken to some other game given by the EmuHub-defined map. Used for mapping PS3 and Vita TITLEIDs to actual game names.
        stores: # ADVANCED - Optional - Defines content repositories for the system. Used for downloading games in EmuHub.
          - type: emudeck # Used for EmuDeck stores. Only functions if EmuDeck has homebrew available for the given system.
            name: EmuDeck
            id: emudeck
          - type: html # Used for web-based stores. html stores expect a URL with some list of links to downloadable content. Pagination is not currently supported.
            name: My HTML Store
            id: myhtmlstore
            url: http://some-homebrew-repo.com/mycoolsystem/games
            selector: "#gamesList tr > .link > a" # CSS selector for grabbing the relevant links from the page. This is just an example; this needs to be sorted out for whatever page is being used.
        romdir: path/to/roms # Optional - Used for overriding the ROMs directory for this system. Default ROMs directory is [EMUHUB-ROMS-DIRECTORY]/[System ID]
      ```
    - Partial entries can be used to extend default systems. For example, to add `.someObscureExt` to our PS1 file extensions:
        - ```yaml
          - id: psx
            fileExtensions:
              - .someObscureExt
          ```
1. Open emulators.yml
    - This file will be blank; this is expected! Default emulator entries can be referenced (but not modified) at EmuHubConfig/defaults/emulators.yml.
1. Add a new entry:
    - ```yaml
      - id: my_cool_system_emu # This should correspond to the emulator you entered in systems.yml!
        name: My Cool System Emu
        args: # Optional - Specifies arguments that should be inserted after the path to the emulator and before the path to the game file when launching a game.
          - -f # Example fullscreen argument
        launchCommand: `%EMUPATH% --game="%ROMPATH%"` # Optional - Can be used instead of args to define a more custom-tailored launch command. See below for available argument tokens (%EMUPATH%, etc.)
        launchCommands: # Optional - Same as launchCommand but defined per-file extension. Useful if some files need to be launched differently than other files.
          .someExt: `%EMUPATH% -abc "%ROMNAMENOEXT%"`
          .someOtherExt: `%EMUPATH% -def "%ROMPATH%"`
        location:
          core: core_name # Use this if your emulator is a RetroArch core. Should correspond to the core's filename, minus the extension (check RetroArch's Cores directory to find this)
          bin: /path/to/emulator.AppImage # Use this if your emulator is not a RetroArch core. AppImage is only an example here; this should be whatever actual executable is used to launch the emulator (.exe, no extension at all, etc)
      ```
    - The following argument tokens are supported when using `launchCommand` or `launchCommands`:
        - %EMUPATH% - example: "/home/Applications/CoolEmu.AppImage"
            - For technical reaons, %EMUPATH% is escaped with strings automatically. *This is not true for any other argument token!*
        - %ROMPATH% - example: /path/to/roms/someSystem/someParentDir/myRom.rom
        - %ROMDIR% - example: /path/to/roms/someSystem/someParentDir
        - %ROMDIRNAME% - example: someParentDir
        - %ROMNAME% - example: myRom.rom
        - %ROMNAMENOEXT% - example: myRom
        - %ROMEXT% - example: .rom
        - %ROMTEXTCONTENT% - example: rom is a text file with contents "Hello". %ROMTEXTCONTENT% is replaced with "Hello"
            - Double-check to make sure you need this if you're using it! Using %ROMTEXTCONTENT% on a ROM that isn't actually a text file will lead to headaches, crashes, crying and also frustration.
    - Partial entries can be used to extend default systems. For example, if I have DuckStation in some exotic location that EmuHub can't automatically find:
      - ```yaml
        - id: duckstation
          location:
            bin: /my/super/exotic/path/to/duckstation/DuckStation.exe
        ```
