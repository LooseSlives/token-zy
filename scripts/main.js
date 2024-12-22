"use strict";

import {
    libWrapper
}
from "./libwrapper_shim.js";

Object.defineProperty(TokenDocument.prototype, "sort", {
    get: function () {
        if (!(this instanceof TokenDocument))
            return 0;
        const z = this.getFlag("token-zy", "zIndexOverride") || 0;
        const isNotDefeated = this.actor?.statuses?.has(CONFIG.specialStatusEffects.DEFEATED) ? 0 : 1;
        return isNotDefeated * this.y + z;
    },
    set: function (value) {}
});

Hooks.once("init", () => {
    libWrapper.register(
        "token-zy",
        "Token.prototype._onDragLeftDrop",
        onTokenDrop,
        "WRAPPER", );
});

Hooks.once("setup", () => {
    game.keybindings.register("token-zy", "send-to-back-key", {
        name: "Send Token To Back",
        hint: "When your mouse is hovered over a stack of tokens, press this key to make the top-most token move to the bottom of the stack",
        editable: [{
                key: 'KeyZ'
            }
        ],
        restricted: false,
        onDown: pushTokenBack
    });
});

Hooks.on("refreshToken", (token) => {
    canvas.tokens.objects.sortDirty = canvas.primary.sortDirty = true;
});

//###################################################
var zPush = 0;

function onTokenDrop(wrapped, event) {
    wrapped(event); // next function in event propagation
    zPush = 0;
    canvas.tokens.placeables.forEach(t => t.document.setFlag("token-zy", "zIndexOverride", zPush));
    canvas.tokens.placeables.forEach(t => t.refresh());
};

function pushTokenBack(event) {
    const hoveredToken = canvas.tokens.hover;
    if (hoveredToken && !event.repeat) {
        zPush -= 1;
        hoveredToken.document.setFlag("token-zy", "zIndexOverride", zPush);
        canvas.tokens.placeables.forEach(t => t.refresh());
    }
}
