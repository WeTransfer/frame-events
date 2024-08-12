/* eslint-disable */

const { ParentFrame } = require("../../build/index");

(function() {
    const state = {
        counter: 0,
    };

    console.log('test')
    const element = document.getElementById("childFrame");
    console.log(element)

    new ParentFrame({
        child: document.getElementById("childFrame"),
        methods: {
            updateCounter: function () {
                state.counter = state.counter++;
                this.send("counterUpdated", {
                    counter: state.counter,
                });

                const counterElement = document.getElementById("counter");
                counterElement.innerHTML = state.counter;
                console.log('!!!')
            },
        },
        listeners: ["counterUpdated"],
        scripts: [],
    });
})();
