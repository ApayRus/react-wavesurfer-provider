# React Component Library

A simple React component library with TypeScript support.

## Available Components

- **Button**: A customizable button component with different variants and sizes.

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd react-component-library

# Install dependencies
npm install
```

### Running the Example App

```bash
npm start
```

This will start the development server and open the example app in your browser.

## Using the Components

### Button Component

```tsx
import { Button } from './components';

// Basic usage
<Button label="Click Me" />

// With variants
<Button label="Primary Button" variant="primary" />
<Button label="Secondary Button" variant="secondary" />
<Button label="Danger Button" variant="danger" />

// With sizes
<Button label="Small Button" size="small" />
<Button label="Medium Button" size="medium" />
<Button label="Large Button" size="large" />

// Disabled state
<Button label="Disabled Button" disabled={true} />

// With click handler
<Button
  label="Click Me"
  onClick={() => console.log('Button clicked!')}
/>
```

## Component Props

### Button Props

| Prop     | Type                                 | Default   | Description                    |
| -------- | ------------------------------------ | --------- | ------------------------------ |
| label    | string                               | required  | Button text content            |
| variant  | 'primary' \| 'secondary' \| 'danger' | 'primary' | Button style variant           |
| size     | 'small' \| 'medium' \| 'large'       | 'medium'  | Button size                    |
| disabled | boolean                              | false     | Whether the button is disabled |
| onClick  | () => void                           | undefined | Click handler function         |

## License

MIT
