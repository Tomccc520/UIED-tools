import type { App } from 'vue'
import 'highlight.js/styles/github.css'
import hljsVuePlugin from '@highlightjs/vue-plugin'

export default (app: App) => {
    app.use(hljsVuePlugin)
}
