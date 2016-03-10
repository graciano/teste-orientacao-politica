module.exports = function(){
    var testJSON    = require('../assets/test.json'),
        Handlebars = require('handlebars'),
        $           = require('jquery');

    var $form_test = $('#form-test');
    $form_test.on('submit', function(ev){
        ev.preventDefault();
        var data = {};
        var formData = $(this).serializeArray();
        for(var i=0; i<formData.length; i++){
            var dataElem = formData[i];
            data[dataElem.name] = dataElem.value;
        }
        var questions = testJSON.questions;

        //initializing results
        var results = (function(){ return testJSON.resultsMap; })();
        for(var key in results){
            if(!results.hasOwnProperty(key))
                continue;
            results[key].total = 0;
        }

        //getting the answers totals
        for(i=0; i<questions.length; i++){
            var question = questions[i];
            var answer = data[question.id];
            console.log(answer);
            results[answer].total++;
        }

        //checking results
        var testResult = results[Object.keys(results)[0]]; // first key in results
        for(key in results){
            if(!results.hasOwnProperty(key))
                continue;
            var thisResult = results[key];
            if(thisResult.total > testResult.total)
                testResult = thisResult;
        }

        //showing to user
        var $testContainer = $('#test-container');
        $testContainer.fadeOut(300, function(){
            var test_container = document.getElementById('test-container');
            var template = document.getElementById('template-result').innerHTML;
            var compiled_template = Handlebars.compile(template);
            test_container.innerHTML = compiled_template(testResult);
            $(this).fadeIn(300);
        });

        return false;
    });
};
