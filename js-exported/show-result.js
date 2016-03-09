module.exports = function(){
    var getFormData = require('../js-exported/serialize-form.js'),
        testJSON    = require('../assets/test.json');
    var form_test = document.getElementById('form-test');
    form_test.addEventListener('submit', function(ev){
        var data = getFormData(form_test);
        var questions = testJSON.questions;

        //initializing results
        var results = testJSON.resultsMap;
        for(var key in results){
            results[key].total = 0;
        }

        //getting the answers totals
        for(var i=0; i<questions.length; i++){
            var question = questions[i];
            var answer = data[question.id];
            console.log(answer);
            results[answer].total++;
        }

        //checking results
        var testResult = results[Object.keys(results)[0]]; // first key in results
        for(key in results){
            var thisResult = results[key];
            if(thisResult.total > testResult.total)
                testResult = thisResult;
        }

        ev.preventDefault();
        return false;
    });
};
