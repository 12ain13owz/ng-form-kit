import { applicationConfig } from '@storybook/angular-vite'
import type { Preview } from '@storybook/angular-vite'
import './styles.css'

const preview: Preview = {
  decorators: [applicationConfig({ providers: [] })],
  parameters: {
    controls: { expanded: true },
    a11y: { test: 'error' },
  },
}

export default preview
