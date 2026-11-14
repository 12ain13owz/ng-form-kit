import { withThemeByClassName } from '@storybook/addon-themes'
import { applicationConfig } from '@storybook/angular-vite'
import type { Preview } from '@storybook/angular-vite'
import './styles.css'

const preview: Preview = {
  decorators: [
    applicationConfig({ providers: [] }),
    // Toolbar switch: puts `.dark` on <html>, the way an app with spartan does.
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
  ],
  parameters: {
    controls: { expanded: true },
    a11y: { test: 'error' },
  },
}

export default preview
