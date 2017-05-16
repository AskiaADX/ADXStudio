ADX Studio
==========

![ADX Studio](https://github.com/AskiaADX/ADXStudio/blob/develop/adxstudio.png?raw=true)

This is the Windows desktop IDE to create and/or edit ADCs (Askia Design Controls) and ADPs (Askia Design Pages) for [Askia](http://www.askia.com/) powered survey controls and layouts. It makes intensive use of [Electron](https://github.com/atom/electron) and [NodeJS](https://nodejs.org/en/).

Setup
-----

#### Installer

Download the [latest release](https://github.com/AskiaADX/ADXStudio/releases/latest) archive.

1.	After downloading the release, unzip `ADXStudioSetup.zip`.
2.	Run the `ADXStudio Setup 1.0.0.exe` executable as `administrator`.
3.	Try to create your ADC or ADP using one of the template, or create a new Project.

*Note: do not tamper with any other components of `ADXStudio Setup 1.0.0.exe` folder.*

#### Manual installation

Clone the repository (via `HTTPS`, `SSH` or simply download the repository as a `.ZIP` archive).

Install [NodeJS](https://nodejs.org/download/).

Open [Powershell](https://msdn.microsoft.com/en-us/dd742419) as an `Administrator` and browse to the local ADXStudio repository.
There, run the following commands:

```
npm install
```

```
electron app/main.js
```

Available resources
-------------------

-	[ADX specifications](https://github.com/AskiaADX/ADXStudio/wiki)
-	[Askiascript documentation](askiascript2_introduction_to_askiascript_2)
-	[List of ADCs 2.0](https://support.askia.com/hc/en-us/sections/200009182-askia-design-control-ADC-2-0-Javascript-)
-	[Askia website](https://askia.com/)

Authors
-------

-  [Maxime Gasnier](https://github.com/Maximeesilv)
-  [Vincent Tellier](https://github.com/VincentTel)
-  [Mamadou Sy](https://github.com/MamadouSy)
-  [Paul Nevin](https://github.com/uncleserb)
-  [Jérôme Sopoçko](https://github.com/BadJerry)
-  [Mehdi Aït-Bachir](https://github.com/AskiaMehdi)
-  [Jérôme Duparc](https://github.com/Djedj)

Contributors
------------

- [Robbe Van der Gucht](https://github.com/sir-ragna)
