ADX Studio
==========

![ADX Studio](https://dl.dropboxusercontent.com/u/4885226/adx-studio_icon.png)

This is the Windows desktop IDE to create and/or edit ADCs (Askia Design Control) 2.0 for [Askia](http://www.askia.com/) powered survey controls. It makes intensive use of [Electron](https://github.com/atom/electron) and [NodeJS](https://nodejs.org/en/).

Requirements
------------

Clone the repository (via `HTTPS`, `SSH` or simply download the repository as a `.ZIP` archive).

Install [NodeJS](https://nodejs.org/download/).

Setup
-----

#### Installer

Download the [latest release](https://github.com/AskiaADX/ADXStudio/releases) archive.

1.	After downloading the release, unzip `ADXStduio_Alpha1_0_0x64.zip` or `ADXStduio_Alpha1_0_0x86.zip` depending on your OS environment.
2.	Open the `ADXStduio_Alpha1_0_0x64` (or `ADXStduio_Alpha1_0_0x86.zip`) folder.
3.	Double-click the `ADXStudioAlpha1_0_0.exe` executable.
4.	Try to create your ADC with the ADCTemplate (project automatically open), or create a new Project.

Note: do not tamper with any other components of `ADXStduio_Alpha1_0_0x64` folder.

#### Manual

Open [Powershell](https://msdn.microsoft.com/en-us/dd742419) as an `Administrator` and browse to the local ADXStudio repository. There, run the following commands:

```
npm update
```

```
electron app/main.js
```

Available resources
-------------------

-	[Askiascript 2.0 specs](https://dev.askia.com/projects/askiadesign/wiki/Askiadesign_askiascript_2_0_specifications)
-	[List of ADCs 2.0](https://support.askia.com/hc/en-us/sections/200009182-askia-design-control-ADC-2-0-Javascript-)
-	[Askia website](http://askia.com/)

Authors
-------

-	[Maxime Gasnier](https://github.com/Maximeesilv)
-	[Mamadou Sy](https://github.com/MamadouSy)
-	[Paul Nevin](https://github.com/uncleserb)
-	[Jérôme Sopoçko](https://github.com/BadJerry)
