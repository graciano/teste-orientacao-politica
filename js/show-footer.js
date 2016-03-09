(function(){
    var Handlebars = require('handlebars'),
        testJSON = require('../assets/test.json');
    var footer = document.getElementById('main-footer');
    var template = document.getElementById('template-footer').innerHTML;
    var compiled_template = Handlebars.compile(template);
    footer.innerHTML = compiled_template(testJSON);
})();
