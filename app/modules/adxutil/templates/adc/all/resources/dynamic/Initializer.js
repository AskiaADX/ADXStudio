(function () {
    var adcdefault = new AdcDefault({
        instanceId: {%= CurrentADC.InstanceId %},
        currentQuestion: '{%:= CurrentQuestion.Shortcut %}',
        type: '{%:= CurrentQuestion.Type %}',
    });
} ());