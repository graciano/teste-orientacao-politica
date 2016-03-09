var shuffle = require('./shuffle.js');
module.exports = function(){
    const SOURCE_FILE = 'assets/teste-texto-puro.txt';
    const OUTPUT_FILE = 'assets/test.json';
    var fs = require('fs');
    var testJSON = {
        questions: [],
        resultsMap  : {}
    };

    function newQuestion(id, text){
        return {
            id: id,
            text: text,
            answers: []
        };
    }

    function newAnswer(id, text, addTo){
        return {
            id: id,
            text: text,
            addTo: addTo
        };
    }

    function addAnswerToLastQuestion(text, letter){
        var question = testJSON.questions.pop();
        question.answers.push(newAnswer(question.id, text, letter));
        testJSON.questions.push(question);
    }

    // sort of states machine
    var startResults = false;
    var resultTitle = false;
    var resultText = false;
    var resultLetter = '';

    fs.readFileSync(SOURCE_FILE).toString().split('\n').forEach(function (line, index, lines) {
        function lineNotEmpty() {
            return line.length > 0;
        }

        if(index===0){
            testJSON.source = line;
        }
        else if(startResults && lineNotEmpty()){
            if(resultText){
                testJSON.resultsMap[resultLetter].text = line;
                resultText = false;
            }
            else if(resultTitle) {
                testJSON.resultsMap[resultLetter].title = line;
                resultTitle = false;
                resultText = true;
            }
            else{
                resultLetter = line.slice(-1).toLowerCase();
                testJSON.resultsMap[resultLetter] = {};
                resultTitle = true;
            }
        }
        else if(lineNotEmpty()) {
            if(line.match('\^[0-9]+.*\$')){
                testJSON.questions.push(
                    newQuestion(index, line.substring(3))
                );
            }
            else if(line.match('\^Resultado\$')){
                startResults = true;
            }
            else {
                var letter = line.substr(0,1);
                var text = line.substr(3);
                addAnswerToLastQuestion(text, letter);
            }
        }
    });

    var questions = testJSON.questions;
    for(var i=0; i<questions.length; i++){
        var question = questions[i];
        question.answers = shuffle(question.answers);
    }
    testJSON.questions = questions;

    fs.writeFile(OUTPUT_FILE, JSON.stringify(testJSON), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
};
