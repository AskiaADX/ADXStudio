Build ADX Studio
================

To build ADX Studio, form the root, execute this command line:

`build -w --x64 --ia32`

-w is for windows
--x64 for 64 bits OS
--ia32 for 32 bits OS

It's using electron-builder (https://github.com/electron-userland/electron-builder) so install it as Global using npm.

To modify parameters, go to package.json at the root of the folder application

Add also as environment variables:
- Properties of the computer
- Advanced system settings
- Advanced tab
- Environment variables button
- Add CSC_LINK User variables and point to the *.p12 askia certificate file
- Add CSC_KEY_PASSWORD User variables and add the password of the p12 file
