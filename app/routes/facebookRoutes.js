var pageToken = process.env.APP_PAGE_TOKEN || "EAAJmBSPcv4kBABA8BAX8vHxf7S8Ld00SRGUTHoAPzjZASqa0XzYgiZC7RYGxAzynpfTfsCZBs2ChFemOdZAv9XHpjqTpVkfGCNIjS9T8ltKZBDk7nBE6ZBL9c8vYmyw6wQEt38uAQE5rvdVZBvcHiI8Q4QULf6E16dZBecVQmbcahAZDZD";

module.exports = function (app, passport) {
    "use strict";
    app.get('/webhook', function (req, res) {
        res.send(req.query['hub.challenge']);
    });

    app.post('/webhook', (req, res) => {
        const messagingEvents = req.body.entry[0].messaging;
        console.log('message received: ', JSON.stringify(messagingEvents));

        messagingEvents.forEach((event) => {
            const sender = event.sender.id;

            if (event.postback) {
                const text = JSON.stringify(event.postback).substring(0, 200);
                sendTextMessage(sender, 'Postback received: ' + text);
            } else if (event.message && event.message.text) {
                const text = event.message.text.trim().substring(0, 200);

                if (text.toLowerCase() === 'generic') {
                    sendGenericMessage(sender);
                } else {
                    sendTextMessage(sender, 'Text received, echo: ' + text);
                }
            }
        });

        res.sendStatus(200);
    });

    function sendMessage (sender, message) {
        request
            .post('https://graph.facebook.com/v2.6/me/messages')
            .query({access_token: pageToken})
            .send({
                recipient: {
                    id: sender
                },
                message: message
            })
            .end((err, res) => {
                if (err) {
                    console.log('Error sending message: ', err);
                } else if (res.body.error) {
                    console.log('Error: ', res.body.error);
                }
            });
    }

    function sendTextMessage (sender, text) {
        sendMessage(sender, {
            text: text
        });
    }

    function sendGenericMessage (sender) {
        sendMessage(sender, {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'generic',
                    elements: [{
                        title: 'First card',
                        subtitle: 'Element #1 of an hscroll',
                        image_url: 'http://messengerdemo.parseapp.com/img/rift.png',
                        buttons: [{
                            type: 'web_url',
                            url: 'https://www.messenger.com/',
                            title: 'Web url'
                        }, {
                            type: 'postback',
                            title: 'Postback',
                            payload: 'Payload for first element in a generic bubble'
                        }]
                    }, {
                        title: 'Second card',
                        subtitle: 'Element #2 of an hscroll',
                        image_url: 'http://messengerdemo.parseapp.com/img/gearvr.png',
                        buttons: [{
                            type: 'postback',
                            title: 'Postback',
                            payload: 'Payload for second element in a generic bubble'
                        }]
                    }]
                }
            }
        });
    }
};