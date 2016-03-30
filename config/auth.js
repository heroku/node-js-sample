module.exports = {

    'facebookAuth' : {
        'clientID'      : process.env.FACEBOOK_CLIENT_ID || '676576985814980',
        'clientSecret'  : process.env.FACEBOOK_CLIENT_SECRET || '1557913137034b22baa6fb522db345f2',
        'callbackURL'   : process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : process.env.TWITTER_CONSUMER_KEY || 'L1PAufebyu5eFukQA6uGtqiyM',
        'consumerSecret'    : process.env.TWITTER_CONSUMER_SECRET || 'pZSWCEcOL0cUTgpGesiWR6gxUvj93635juQ7fqyCSghVqn3kzF',
        'callbackURL'       : process.env.TWITTER_CALLBACK_URL || 'http://localhost:5000/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};