import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'lib/index.js',
    output: {
        file: 'lib/bundle.js'
    },
    plugins:[
        commonjs()
    ]
}