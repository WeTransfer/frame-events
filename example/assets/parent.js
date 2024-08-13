/* eslint-disable */

const testDomain = 'http://localhost:3030'

const { ParentFrame } = require('../../build/index');

const childFrameNode = document.createElement('iframe');

childFrameNode.src = `${testDomain}/ChildFrame.html?_origin=${testDomain}&_placement=TEST`

childFrameNode.width = 500;
childFrameNode.height = 360;

childFrameNode.onload = ({ target }) => {
    const state = {
        counter: 0,
    };

    const parentFrame = new ParentFrame({
        childFrameNode: target,
        methods: {
            updateCounter: () => {
                state.counter++;

                const counterElement = document.getElementById('counter');
                counterElement.innerHTML = state.counter;
            },
        },
        listeners: ['parentClicked'],
        scripts: [`
            <script>
                const el = document.createElement("div");
                el.innerHTML = "This text is injected by the Parent Frame script.";
                el.style = "background: yellow";
                document.body.prepend(el)
            </script>
        `],
    });

    const sendEventButton = document.getElementById('sendParentEvent');
    sendEventButton.onclick = () => {
        parentFrame.send('parentClicked');
    }
}


document.body.appendChild(childFrameNode);
