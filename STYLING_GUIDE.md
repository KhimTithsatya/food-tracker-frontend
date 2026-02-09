# Frontend Styling Guide

## Overview
The Food Tracker frontend uses **Tailwind CSS** for all styling. All pages and components follow a consistent design system.

## Color Palette

### Primary Colors
- **Blue 600**: `#2563eb` - Main actions, primary buttons, links
- **Blue 700**: `#1d4ed8` - Hover states
- **Gray 900**: `#111827` - Headings, dark text
- **Gray 700**: `#374151` - Secondary text

### State Colors
- **Green**: Success messages and positive indicators
- **Red**: Errors and destructive actions
- **Yellow**: Warnings
- **Purple**: Tertiary/supplementary information

## Component System

### Buttons
```jsx
// Primary button
<button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
  Save
</button>

// Secondary button
<button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">
  Cancel
</button>

// Danger button
<button className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700">
  Delete
</button>
```

### Forms & Inputs
```jsx
// Input field
<input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />

// Label
<label className="block text-sm font-medium text-gray-700 mb-1">Label Text</label>

// Form group
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
    <input className="input" />
  </div>
</div>
```

### Cards
```jsx
// Standard card
<div className="bg-white rounded-lg shadow-md p-6">
  Content here
</div>

// Stat card
<div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
  <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase">Title</h3>
  <p className="text-3xl font-bold text-blue-600">Value</p>
</div>
```

### Tables
```jsx
<table className="w-full">
  <thead className="bg-gray-50 border-b">
    <tr>
      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Column</th>
    </tr>
  </thead>
  <tbody className="divide-y">
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4 text-sm text-gray-900">Cell</td>
    </tr>
  </tbody>
</table>
```

### Alerts
```jsx
// Success alert
<div className="alert-success">Success message</div>

// Error alert
<div className="alert-error">Error message</div>

// Warning alert
<div className="alert-warning">Warning message</div>
```

## Layout Patterns

### Page Header
```jsx
<div className="page-header">
  <h1 className="page-title">Page Title</h1>
  <p className="page-subtitle">Subtitle text</p>
</div>
```

### Grid Layouts
```jsx
// 3-column grid (responsive)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>

// 2-column layout with sidebar
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-1">{/* Sidebar */}</div>
  <div className="lg:col-span-2">{/* Main content */}</div>
</div>
```

## Spacing
- Small gaps: `gap-2`, `gap-3`
- Medium gaps: `gap-4`, `gap-6`
- Large gaps: `gap-8`, `gap-12`

## Typography
- Page title: `text-4xl font-bold text-gray-900`
- Section title: `text-3xl font-bold text-gray-900`
- Card title: `text-xl font-bold text-gray-900`
- Label: `text-sm font-medium text-gray-700`
- Body text: `text-sm text-gray-600`

## Reusable Components

### StatCard
```jsx
import StatCard from '@/components/admin/StatCard';

<StatCard title="Users" value={100} color="blue" icon="👥" />
```

### DataTable
```jsx
import DataTable from '@/components/admin/DataTable';

<DataTable 
  columns={[{ key: 'name', label: 'Name' }]}
  data={data}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### Button
```jsx
import Button from '@/components/Button';

<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger">Delete</Button>
```

### Input
```jsx
import Input from '@/components/Input';

<Input label="Name" placeholder="Enter name" error={error} />
```

### Alert
```jsx
import Alert from '@/components/Alert';

<Alert type="success" title="Success" message="Changes saved" />
```

## Responsive Design
- Mobile first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Use `md:` and `lg:` prefixes for larger screens

## Dark Mode (Future)
Tailwind is configured to support dark mode. Use `dark:` prefix when dark mode is enabled.

## Best Practices
1. Use component library components when available
2. Avoid inline styles - use Tailwind classes
3. Maintain consistent spacing using Tailwind gap system
4. Use semantic HTML elements
5. Ensure accessible color contrast (WCAG AA minimum)
6. Test responsive design on mobile, tablet, and desktop

## File Structure
- `/components` - Reusable UI components
- `/components/admin` - Admin-specific components
- `/components/user` - User-specific components
- `/app/globals.css` - Global styles and component extensions
- `tailwind.config.js` - Tailwind configuration
