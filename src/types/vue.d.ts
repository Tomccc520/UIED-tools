import 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $ensureFreeToolTitle: (title: string) => string
  }
}

export {}
