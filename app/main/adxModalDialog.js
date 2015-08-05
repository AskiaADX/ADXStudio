


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
        no  = document.createElement('button');

        buttonContener.appendChild(no);
        buttonContener.appendChild(yes);

        no.className = 'no';
        no.style.order = 2;
        no.innerHTML = 'No';

        yes.className = 'yes';
        yes.style.order = 3;
        yes.innerHTML = 'Yes';

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

  function clickonCancel() {

    console.log(event.srcElement);

    document.body.removeChild(lightBox);
    document.body.removeChild(dialog);
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

  callback(e);
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
