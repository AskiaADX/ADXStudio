Build ADX Studio
================

To build ADX Studio, form the root, execute this command line using powershell on windows as administrator:

`build -w --x64 --ia32`

-w is for windows
--x64 for 64 bits OS
--ia32 for 32 bits OS

It's using electron-builder (https://github.com/electron-userland/electron-builder) so install it as Global using npm.

To modify parameters, go to package.json at the root of the folder application

For code signing certificate:
- create a `tmp` folder at the root app folder
- add your .p12 file
- modify the win.certificateFile path and win.certificatePassword in package.json
(Make sure to delete the password in package.json after the build)
