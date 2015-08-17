//TODO::Functions inside all parts of case (function cancel, ok, yes...).


/*
* API SHOWMODALDIALOG
*
*
* Utilisation of the function :
*
*
*       showModalDialog('prompt','Write the new name', value);
*       // Open different ModalDialog at each type.
*
*       showModalDialog('yesNoCancel','Are you sure to continue?');
*
* @param {Object} config configuration of modalDialog.
* @param {String | "okOnly" | "yesNoCancel" | "prompt" | "yesNo" | "okCancel"} config.type type of the modal.
* @param {String} config.value innitial value for prompt window.
* @param {Function} [callback] callback.
*
*/
function showModalDialog(config, callback) {

//Create elements that will be in the API.
var   text             = document.createElement('label'),
      dialog           = document.createElement('div'),
      iconTextContener = document.createElement('div'),
      textContener     = document.createElement('div'),
      buttonContener   = document.createElement('div'),
      lightBox         = document.createElement('div'),
      configType       = config.type,
      textValue        = config.text;

//Initializate the base of the view that we'll be able to change.

//Parent caracteristics of static part.
document.body.appendChild(lightBox);
document.body.appendChild(dialog);
dialog.appendChild(iconTextContener);
iconTextContener.appendChild(textContener);
textContener.appendChild(text);
dialog.appendChild(buttonContener);

//lightBox, dialog, icon, iconTextContener, textContener and buttonContener properties.
dialog.id = 'dialog';
text.className = 'text';
lightBox.id = 'hideWindow';
textContener.id = 'textContener';
buttonContener.id = 'buttonContener';
iconTextContener.id = 'iconTextContener';


//SWITCH BETWEEN ALL TYPES PRESENT IN THE OBJECT CONFIG.
  switch (config.type) {

// In the case 'yesNoCancel', we disable the 'break;'
// because we can have the case 'yesNo' caracteristics inside the case 'yesNoCancel'.
    case 'yesNoCancel':
    var cancel = document.createElement('button');
    cancel.innerHTML = 'Cancel';
    buttonContener.appendChild(cancel);

    cancel.className = 'cancel';
    cancel.style.order = 1;

    case 'yesNo':
    var yes = document.createElement('button'),
        no  = document.createElement('button'),
        prompt = document.createElement('input');

        buttonContener.appendChild(no);
        buttonContener.appendChild(yes);
        textContener.appendChild(prompt);

        no.className = 'no';
        no.style.order = 2;
        no.innerHTML = 'No';

        yes.className = 'yes';
        yes.style.order = 3;
        yes.innerHTML = 'Yes';

        prompt.className = 'prompt';
        prompt.style.border = 'none';
        prompt.style.background = 'none';
        prompt.setAttribute('readonly', 'true');
        prompt.value = config.value || '';
        text.innerHTML = textValue;
      break;

//In the case 'prompt', we have disable the 'break;'
//because we can have the caracteristics of the case 'okCancel' inside the case 'prompt'.
    case 'prompt':
    var cancel = document.createElement('button'),
        prompt = document.createElement('input');

    textContener.appendChild(prompt);
    buttonContener.appendChild(cancel);

    prompt.className = 'prompt';
    prompt.focus();
    prompt.value = config.value || '';
    cancel.className = 'cancel';
    cancel.style.order = 1;
    cancel.innerHTML = 'Cancel';

    case 'okCancel':
    var ok  = document.createElement('button');

    buttonContener.appendChild(ok);

    ok.className = 'ok';
    ok.style.order = 2;
    ok.innerHTML = 'OK';

    text.innerHTML = textValue;
      break;

    case 'okOnly':
    var ok = document.createElement('button');

    buttonContener.appendChild(ok);

    ok.className = 'ok';
    ok.innerHTML = 'OK';

    text.innerHTML = textValue;
      break;

      /**
      * Form : made for the New Project options.
      *
      * showModalDialog({type: 'form', text: ''}, function(callback) )
      *
      * This function should return an pbject with all values that's have been written in the form.
       */
      case 'form':

      dialog.removeChild(iconTextContener);
      dialog.removeChild(buttonContener);

      //Creation of new component in the dialog
      var nameContener       = document.createElement('div'),
          pathContener       = document.createElement('div'),
          descrContener      = document.createElement('div'),
          tmpContener        = document.createElement('div'),
          nameTextForm       = document.createElement('label'),
          nameForm           = document.createElement('input'),
          pathTextForm       = document.createElement('label'),
          pathForm           = document.createElement('input'),
          pathButton         = document.createElement('button'),
          descrTextForm      = document.createElement('label'),
          descrForm          = document.createElement('textarea'),
          tmpTextForm        = document.createElement('label'),
          tmpForm            = document.createElement('select')
          ok                 = document.createElement('button'),
          cancel             = document.createElement('button');


      // Initialize buttons of the dialog.
      buttonContener.appendChild(cancel);
      buttonContener.appendChild(ok);


      ok.className = 'ok';
      ok.innerHTML = 'OK';
      cancel.className = 'cancel';
      cancel.innerHTML = 'Cancel';

      text.innerHTML = textValue;

      // Resizing the Dialog to get a larger DIVISION
      dialog.style.display = 'flex';
      dialog.style.paddingTop = '40px';
      dialog.style.flexDirection = 'column';
      dialog.style.justifyContent = 'space-around';
      dialog.style.top = '30%';
      dialog.style.height = 500 + 'px';


      //Define position of all divContener inside the Dialog.
      dialog.appendChild(nameContener);
      dialog.appendChild(pathContener);
      dialog.appendChild(descrContener);
      dialog.appendChild(tmpContener);
      dialog.appendChild(buttonContener);
      tmpContener.id   = 'tmpContener';
      pathContener.id  = 'pathContener';
      nameContener.id  = 'nameContener';
      descrContener.id = 'descrContener';

      //Define all Label and input inside each divContener.
      nameContener.appendChild(nameTextForm);
      nameContener.appendChild(nameForm);
      pathContener.appendChild(pathTextForm);
      pathContener.appendChild(pathForm);
      pathContener.appendChild(pathButton);
      pathContener.appendChild(pathButton);
      descrContener.appendChild(descrTextForm);
      descrContener.appendChild(descrForm);
      tmpContener.appendChild(tmpTextForm);
      tmpContener.appendChild(tmpForm);

      nameForm.className = 'formInput';
      pathForm.className = 'formInput';
      pathButton.innerHTML = '...';
      pathButton.id = 'formPathButton';
      descrForm.className = 'formInput';
      descrForm.classList.add('formDescr');
      tmpForm.className = 'formInput';
      tmpForm.classList.add('formSelect');


      nameTextForm.className = 'formLabel';
      pathTextForm.className = 'formLabel';
      descrTextForm.className = 'formLabel';
      tmpTextForm.className = 'formLabel';

      nameTextForm.innerHTML = 'Name: ';
      pathTextForm.innerHTML = 'Path: ';
      descrTextForm.innerHTML = 'Description: ';
      tmpTextForm.innerHTML = 'Template: ';

      pathButton.addEventListener('click', connectToDialog);

      break;


    default:
    break;
  }

//This part is the function part. We execute the callback here  and return an object wich contains the button clicked and the value.
// After that the callback can be sent.
  if(callback) {

    //Event on click on button
    if ( config.type === 'okOnly') {
          ok.addEventListener('click', clickon);
          document.body.addEventListener('keypress', enterEchap);
    }

    if (config.type === 'prompt' || config.type === 'okCancel') {

      ok.addEventListener('click', clickon);
      cancel.addEventListener('click', clickonCancel);
      document.body.addEventListener('keypress', enterEchap);
    }
    if (config.type === 'yesNo') {
        yes.addEventListener('click', clickon);
        no.addEventListener('click', clickonCancel);
        document.body.addEventListener('keypress', enterEchap);
    }

    if (config.type === 'yesNoCancel') {

      yes.addEventListener('click', clickon);
      no.addEventListener('click', clickonCancel);
      cancel.addEventListener('click', clickonCancel);
    }

    if (config.type === 'form') {

      ok.addEventListener('click', formClickon);
      cancel.addEventListener('click', clickonCancel);
    }

  } else {
    console.log('No callbacks in the function');
  }

  //Function to quit the modal dialog options ---> Remove all event inside.
  function quit() {

    document.body.removeEventListener('keypress', enterEchap);
    document.body.removeChild(dialog);
    document.body.removeChild(lightBox);

    if (config.type === 'prompt' || config.type === 'okCancel') {

      ok.removeEventListener('click', clickon);
      cancel.removeEventListener('click', clickonCancel);

    }

    if (config.type === 'okOnly') {
      ok.removeEventListener('click', clickon);

    }

    if (config.type ==='yesNo') {
      yes.removeEventListener('click', clickon);
      no.removeEventListener('click',clickonCancel);

    }

    if (config.type === 'yesNoCancel') {
      yes.removeEventListener('click', clickon);
      cancel.removeEventListener('click', clickonCancel);

    }
    if (config.type === 'form') {

      ok.removeEventListener('click', formClickon);
      cancel.removeEventListener('click', clickonCancel);
    }
  }

  function clickon(event) {

    console.log(event.srcElement);

    var  clicked = {
      button: event.srcElement.className
    };

    if (config.type === 'prompt') {
      clicked.value = prompt.value;
    }

    if (clicked.button === 'ok' || clicked.button === 'yes') {
      callback(clicked);
    }

    console.log(clicked);
    quit();
    return clicked;
  }


//Function which disable the modal dialog when cancel button is clicked.
  function clickonCancel() {

    console.log(event.srcElement);

    document.body.removeChild(lightBox);
    document.body.removeChild(dialog);
  }



// function special for the form when ok is click
  function formClickon(event) {

    var  clicked = {
      button: event.srcElement.className
    };

    if (clicked.button === 'ok') {

      clicked.name = nameForm.value;
      clicked.path =  pathForm.value;
      clicked.description = descrForm.value;
      clicked.tmp = tmpForm.value;

      callback(clicked);
    }

    console.log(clicked);
    quit();
    return clicked;

}

  //function to open a dialog, in order o get path selected.
  function connectToDialog (event) {
    var remote = require('remote');
    var openDialog = remote.require('dialog');

      openDialog.showOpenDialog({properties: ['openDirectory']}, function(folderpath) {
        if (folderpath != undefined) {
          pathForm.value = folderpath;
        }

      });
  }



  // function for enter and Echap.
  function enterEchap(e) {

    var clicked = {};

    if (e.keyCode == 13) {

      if (config.type === 'prompt') {

        clicked.button = 'ok';
        clicked.value = prompt.value;

      }

      if (config.type === 'okOnly' || config.type === 'okCancel') {

        clicked.button = 'ok';
        clicked.value = '';

      }

      if (config.type === 'yesNo' || config.type ==='yesNoCancel') {

        clicked.button = 'ok';
        clicked.value = '';
      }
    } else {

      return;
  }

  callback(clicked);
  console.log(clicked);
    quit();
    return clicked;

  }

}

//EXEMPLE DE FONCTION A APPELE DANS SHOMODALDIALOG.
function example(e) {
  console.log(e, 'example callback');
 }


//showModalDialog({type:'prompt', text:'Are you ready to face the futur ?', img: 'cross.png'});
