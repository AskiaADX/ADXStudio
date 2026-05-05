(function () {
var arrLiveRoutingInputCode = [];
var arrLiveRoutingShortcut = [];
{% 
Dim liveRoutingIndex = 1
For liveRoutingIndex = 1 to CurrentQuestions.Count
    If (CurrentQuestions[liveRoutingIndex].IsLiveRoutingSource) Then
        %} arrLiveRoutingInputCode.push('{%:= CurrentQuestions[liveRoutingIndex].InputCode %}');
             arrLiveRoutingShortcut.push('{%:= CurrentQuestions[liveRoutingIndex].Shortcut %}');
{% EndIf
Next liveRoutingIndex
%}
window.arrLiveRoutingInputCode = arrLiveRoutingInputCode;
window.arrLiveRoutingShortcut = arrLiveRoutingShortcut;
}());