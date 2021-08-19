module.exports = function (api) {
    api.cache(true);

    return {
        "presets": [
            "@babel/preset-env"
        ],
        "plugins": [
            "transform-vue-jsx",
            [
                "@babel/plugin-transform-modules-commonjs",
                {
                    "allowTopLevelThis": true
                }
            ]
        ]
    };
};