var devMode = false;

module.exports = {

    'facebookAuth' : {
        'clientID'      : devMode ? '676576985814980' : '675122215960457',
        'clientSecret'  : devMode ? '1557913137034b22baa6fb522db345f2' : 'bcf4388b3bbf99d2f56476e462bf311d',
        'callbackURL'   : devMode ? "http://localhost:5000/auth/facebook/callback" : 'https://nodejs-quizzes.herokuapp.com/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};