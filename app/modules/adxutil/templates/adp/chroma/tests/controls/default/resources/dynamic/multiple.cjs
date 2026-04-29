{% If CurrentQuestion.Type = "multiple" Then %}
(function () {
    var adcdefault = new AdcDefault({
        instanceId: {%= CurrentADC.InstanceId %}
    });
} ());
{% EndIf %}