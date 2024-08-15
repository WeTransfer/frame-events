const { ChildFrame } = require('../../build/index');

const addMessage = (text) => {
    const messagesBox = document.getElementById('messages');
    const message = document.createElement('li');
    message.append(text);
    messagesBox.append(message);
}

const frameEvents = new ChildFrame((data) => {
    addMessage('Parent "Ready" event');

    frameEvents.listeners.parentClicked(() => {
        addMessage('Parent click event');
    });

});

document.querySelector('button').addEventListener('click', (data) => {
  frameEvents.run.updateCounter();
});
