(function(){
    var Handlebars = require('handlebars'),
        testJSON = require('../assets/test.json'),
        showResult = require('../js-exported/show-result.js');
    var form_test_container = document.getElementById('test-container');
    var template = document.getElementById('template-form').innerHTML;
    var compiled_template = Handlebars.compile(template);
    form_test_container.innerHTML = compiled_template(testJSON);
    showResult();
})();
