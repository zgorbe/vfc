const mixins = {
    methods: {
        stringReplaceAt: (str, repl, index) => str.substr(0, index) + repl + str.substr(index + repl.length),
        getFigureCss: (figure) => {
            const cssClassPrefix = figure.toUpperCase() == figure ? 'v' : 'f';
            return {
                [cssClassPrefix + figure.toLowerCase()]: true
            }
        }
    }  
};

export default mixins;