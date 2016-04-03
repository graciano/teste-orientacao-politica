module.exports = function(message){
    var button_share = document.getElementById('button-share-facebook');
    button_share.addEventListener('click', function(){
        FB.ui({
            method: 'feed',
            link: 'http://graciano.github.io/teste-orientacao-politica',
            caption: message
        }, function(response){});
    });
};
