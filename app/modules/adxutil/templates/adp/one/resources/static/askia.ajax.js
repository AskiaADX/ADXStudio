(function () {
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();
(function () {
  //if (!window.arrLiveRoutingInputCode ||  window.arrLiveRoutingInputCode.length <= 0 ) {
  //  	return;
  //}
  if (window.AskiaScript & !window.isDesignPreview) {
    AskiaScript.executeLiveRouting = function () {};
  }
  // Augment or create the public `askia` namespace
  var askia = window.askia || {};
  if (!window.askia) {
    window.askia = askia;
  }

  /* ---======== Utilities ========--- */

  /**
   * Capitalize the first letter of the string and return the new string
   *
   * @param {String} str String to capitalize
   */
  function capitalize (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Iterate over all submittable elements of a form
   * )This method was inspired from jQuery.serializeArray)
   *
   * @param {HTMLElement} elForm Form element to parse
   * @param {Function} fn Function called for each submittable elements
   * @param {HTMLElement} fn.element Submittable element
   */
  function forEachSubmittableElements (elForm, fn) {
    if (typeof fn !== 'function') {
      return;
    }

    // Don't submit all input submittable
    var rgSubmitter = /^(?:submit|button|image|reset|file)$/i;
    // Submittable elements
    var rgSubmittable = /^(?:input|select|textarea|keygen)/i;
    // Elements that have a checked state
    var rgCheckable = /^(?:checkbox|radio)$/i;
    // List of elements
    var els = elForm.elements;
    var i;

    for (i = 0, l = els.length; i < l; i += 1) {
      var el = els[i];

      if (!el.name || el.disabled || el.value === null ||
                    rgSubmitter.test(el.type) ||
                    !rgSubmittable.test(el.nodeName) ||
                    (rgCheckable.test(el.type) && !el.checked)) {

        continue;
      }

      fn(el);
    }
  }

  /**
   * Serialize the Askia Form to an object
   *
   * @param {HTMLElement} elForm Form element to serialize
   * @param {String} [action] Action to use instead of the regular form action
   * @return {String} Return the form data that should normally be send to the server-side
   */
  askia.serializeForm = function serializeForm (elForm, action) {
    var params = [];
    forEachSubmittableElements(elForm, function (el) {
      var name = el.name
      var value = el.value.replace(/\r?\n/gi, '\r\n');
      if (action && /^(?:action)$/i.test(el.name)) {
        value = action.replace(/\r?\n/gi, '\r\n');
      }
      params.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
    });
    return params.join('&');
  };

  /**
   * Execute an AJAX query
   *
   * @param {Object} query AJAX query to execute
   * @param {String} query.url URL of the server-side management
   * @param {"GET"|"POST"|string} [query.method="POST"] Request method to use
   * @param {String} [query.data=null] Data to send to the server side
   * @param {Function} [query.success] Callback on success
   * @param {String} query.success.text Text of the response
   * @param {XMLHttpRequest} query.success.xhr XMLHTTPRequest used
   * @param {Function} [query.error] Callback on error
   * @param {String} query.error.text Text of the response
   * @param {XMLHttpRequest} query.error.xhr XMLHTTPRequest used
   * @param {Function} [query.complete] Callback on query complete (success or error)
   * @param {String} query.complete.text Text of the response
   * @param {XMLHttpRequest} query.complete.xhr XMLHTTPRequest used
   */
  askia.ajax = function ajax (query) {
    if (!query) {
      (console && console.warn('The `query` argument must be a valid object for askia.ajax()'));
      return;
    }
    if (!query.url || typeof query.url !== 'string') {
      (console && console.warn('The `query.url` argument must be a valid string for askia.ajax()'));
      return;
    }

    query.method = ((query.method && query.method.toString()) || 'POST').toUpperCase();
    if (!/^(?:GET|POST|PUT|DELETE|HEAD|OPTIONS|TRACE|CONNECT)$/.test(query.method)) {
      (console && console.warn('The `query.method` argument must be a valid HTTP method for askia.ajax()'));
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open(query.method, query.url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.onload = function onXhrLoad () {
      var text = xhr.responseText;
      if (xhr.status >= 200 && xhr.status < 400) {
        if (typeof query.success === 'function') {
          query.success(text, xhr);
        }
      } else {
        if (typeof query.error === 'function') {
          query.error(text, xhr);
        }
      }

      if (typeof query.complete === 'function') {
        query.complete(text, xhr);
      }
    };

    xhr.onerror = function () {
      if (typeof query.error === 'function') {
        query.error(text, xhr);
      }
      if (typeof query.complete === 'function') {
        query.complete(text, xhr);
      }
    };

    xhr.send(query.data || null);
  };


  /* ---======== Askia Events Management ========--- */

  askia.defaultEventActions = {
    askiaAnswer: executeLiveRouting,
    askiaShowQuestion: executeShowHideQuestion,
    askiaHideQuestion: executeShowHideQuestion,
    askiaShowResponses: null,
    askiaHideResponses: null,
    askiaReload: executeReload,
    askiaSetValue: null,
    askiaShowMessage: null,
    askiaChangeQuestionsOrder: null,
    askiaChangeResponsesOrder: null,
    askiaInfo: null,
    askiaUpdateCaption: executeUpdateCaption
  };


  /**
   * Trigger an arbitrary event
   *
   * @param {String} eventName Name of the event to trigger
   * @param {Object} detail Detail associated with the event
   */
  askia.triggerEvent = function triggerEvent (eventName, detail) {
    var eventInit = detail !== undefined ? { detail: detail } : undefined;
    var event = new CustomEvent(eventName, eventInit);
    return document.dispatchEvent(event);
  };

  /**
   * Trigger an event when the respondent is answering
   */
  askia.triggerAnswer = function triggerAnswer () {
    if (!askia.triggerEvent('askiaAnswer')) {
      return false; // preventDefault() has been called
    }

    // Default behaviour
    askia.defaultEventActions.askiaAnswer();
  };

  /* ---======== Default Events Management ========--- */

  /**
   * Show or hide an entire question
   *
   * @param {Object} data Definition of the action to do
   * @param {"showQuestion"|"hideQuestion"} data.action Action to execute
   * @param {Number} data.inputCode Input code associated with the question
   */
  function executeShowHideQuestion (data) {
    if (!(data.question.inputCode >= 0)) {
      return;
    }
    var isShow = /^(?:show)/i.test(data.action);
    var className = '.askia-question-' + data.question.inputCode;
    var elements = document.querySelectorAll(className);
    var i;
    var l;
    for (i = 0, l = elements.length; i < l; i += 1) {
      elements[i].style.display = isShow ? '' : 'none';
    }
  }

  /**
   * Update a live caption
   *
   * @param {Object} data Definition of the action to do
   * @param {"updateCaption"} data.action Action to execute
   * @param {String} data.selector The selector is a CSS Class (prefix `.`) or and HTML identifier (prefix `#`)
   * @param {String} data.caption The updated caption
   */
  function executeUpdateCaption (data) {
    if (data.selector === '') {
      return;
    }
    var className = data.selector;
    var caption = data.caption;
    var elements = document.querySelectorAll(className);
    var i;
    var l;
    for (i = 0, l = elements.length; i < l; i += 1) {
      elements[i].innerHTML = caption;
    }
  }

  /**
   * Reload the page
   */
  function executeReload () {
    if (isPreventReload) return;
    window.location.reload();
  }

  /* ---======== Live Routing Management ========--- */

  var isExecutingLiveRouting = false;     // Flag to avoid several live routing request
  var shouldReExecuteLiveRouting = false; // Flag to re-execute the live routing
  var isPreventReload = true;     		    // Flag to prevent the page to reload on loop

  /**
   * Execute the AJAX query to do a live routing
   */
  function executeLiveRouting () {
    if (isExecutingLiveRouting) {
      shouldReExecuteLiveRouting = true;
      return;
    }
    isExecutingLiveRouting = true;
    shouldReExecuteLiveRouting = false;
    askia.ajax({
      url: '../cgi-bin/AskiaExt.dll' + window.location.search,
      data: askia.serializeForm(document.forms[0], 'DoLiveRouting'),
      success: onLiveRoutingSuccess,
      complete: onLiveRoutingComplete
    });
  }

  /**
   * Manage the live routing AJAX - success
   */
  function onLiveRoutingSuccess (text) {
    var json = JSON.parse(text);
    var actions = json.actions || [];
    var i;
    var l;
    var itemAction;
    var eventName;
    for (i = 0, l = actions.length; i < l; i += 1) {
      itemAction = actions[i];
      eventName = 'askia' + capitalize(itemAction.action);
      if (!askia.triggerEvent(eventName, itemAction)) {
        continue; // preventDefault();
      }
      // Default behaviour
      if (typeof askia.defaultEventActions[eventName] === 'function') {
        askia.defaultEventActions[eventName](itemAction);
      }
    }
  }

  /**
   * Manage the live routing AJAX - complete
   */
  function onLiveRoutingComplete () {
    isExecutingLiveRouting = false;
    isPreventReload = false;
    if (!shouldReExecuteLiveRouting) {
      return;
    }
    setTimeout(executeLiveRouting, 250);
  }

  /**
   * Manage the live routing for classical askia form (Non ADCs)
   * Trigger the answers to the server side on the event change or input
   */
  document.addEventListener('DOMContentLoaded', function (){

    /**
     * Change event listener for the closed question form controls
     */
    document.addEventListener('change', function (event){
      var el = event.target || event.srcElement;
      // Retrieve the InputCode number of the question
      var rg = /^[a-z]+([0-9]+)(?:\s*|\_*)/i.exec(el.name);
      if (rg && (window.arrLiveRoutingInputCode.indexOf(rg[1]) > -1) &&
                (((el.nodeName === 'INPUT') &&
                  (el.parentElement.className.indexOf('askia-response') >= 0 ||
                   el.parentElement.className.indexOf('askia-control') >= 0 ||
                   el.parentElement.className.indexOf('askia-grid-row') >= 0 ||
                   el.parentElement.parentElement.className.indexOf('askia-grid-row') >= 0)  &&
                  (el.type === 'radio' || el.type === 'checkbox')) || el.nodeName === 'SELECT')) {
          askia.triggerAnswer();
      }
    });
    /**
     * Input event listener for the numerical and open ended question form controls
     */
    document.addEventListener('input', function (event){
      var el = event.target || event.srcElement;
      // Retrieve the InputCode number of the question
      var rg = /^[a-z]+([0-9]+)(?:\s*|\_*)/i.exec(el.name);
      if (rg && (window.arrLiveRoutingInputCode.indexOf(rg[1]) > -1) &&
                (((el.nodeName === 'TEXTAREA') ||
                  ((el.nodeName === 'INPUT') && (el.type === 'color' ||
                    el.type === 'date' || el.type === 'datetime' ||
                    el.type === 'email' || el.type === 'month' ||
                    el.type === 'number' || el.type === 'password' ||
                    el.type === 'range' || el.type === 'search' ||
                    el.type === 'tel' || el.type === 'text' ||
                    el.type === 'time' || el.type === 'url' || el.type === 'week'))) &&
                 (el.parentElement.className.indexOf('askia-response') >= 0 ||
                  el.parentElement.className.indexOf('askia-control') >= 0 ||
                  el.parentElement.className.indexOf('askia-grid-row') >= 0 ||
                  el.parentElement.parentElement.className.indexOf('askia-grid-row') >= 0 ||
                  el.className.indexOf('askia-live') >= 0))) {
        askia.triggerAnswer();
      }
    });
    if (window.arrLiveRoutingShortcut && window.arrLiveRoutingShortcut.length >= 1) {
        askia.triggerAnswer();
    }

  });

}());
